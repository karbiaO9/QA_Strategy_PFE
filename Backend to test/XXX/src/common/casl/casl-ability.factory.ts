import {
  AbilityBuilder,
  createMongoAbility,
  ForcedSubject,
  MongoAbility,
} from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type Redis from 'ioredis';
import { Role, RoleDocument } from '../../modules/roles/schemas/role.schema';
import {
  Permission,
  PermissionDocument,
} from '../../modules/permissions/schemas/permission.schema';
import { Patient } from '../../modules/patients/schemas/patient.schema';
import { Kine } from '../../modules/kines/schemas/kine.schema';
import { CaslAction } from '../enums/casl-action.enum';
import { CaslSubject, CaslSubjectType } from '../enums/casl-subject.enum';
import { REDIS_CLIENT } from '../redis/redis.module';
import { RedisKeys, REDIS_TTL } from '../redis/redis-keys';

type PatientSubject = Patient & ForcedSubject<CaslSubject.PATIENT>;
type KineSubject = Kine & ForcedSubject<CaslSubject.KINE>;

export type AppSubjects = CaslSubjectType | PatientSubject | KineSubject;
export type AppAbility = MongoAbility<[CaslAction, AppSubjects]>;

export interface PermissionOverrideInput {
  permissionId: string | Types.ObjectId;
  granted: boolean;
}

export interface CaslUser {
  sub: string;
  type: string; // 'kine' | 'patient' | 'admin'
  cabinetId: string | null;
  roleSlug: string;
  /**
   * Active profile id (kines only, set by ProfileGuard). Drives the cache
   * key so two profiles of the same kine get two distinct abilities.
   */
  profileId?: string;
  /**
   * Per-profile overrides applied on top of the role rules. `granted:true`
   * adds a `can`, `granted:false` adds a `cannot`. Kines only.
   */
  customPermissionOverrides?: PermissionOverrideInput[];
}

/**
 * One row of the wire-shape permissions array. Identical to a CASL raw
 * rule, so the frontend can feed `response.permissions` straight into
 * `createMongoAbility(...)` without any transform.
 */
export interface PermissionRule {
  action: string;
  subject: string;
  conditions: Record<string, any> | null;
  /** Present and `true` for `cannot` rules (explicit deny). Omitted for grants. */
  inverted?: true;
}

export type FlatPermissions = PermissionRule[];

const CACHE_VERSION = 2;

@Injectable()
export class CaslAbilityFactory {
  // Single source of truth for the permissions cache TTL: REDIS_TTL.PERMS,
  // itself driven by PERMS_CACHE_TTL_SECONDS env var.
  private readonly TTL_SECONDS = REDIS_TTL.PERMS;

  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async createForUser(
    user: CaslUser,
  ): Promise<{ ability: AppAbility; permissions: FlatPermissions }> {
    const cacheKey = this.cacheKeyFor(user);
    const cached = await this.safeRedisGet(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as {
          v?: number;
          rules?: FlatPermissions;
        };
        if (parsed.v === CACHE_VERSION && Array.isArray(parsed.rules)) {
          const ability = createMongoAbility<[CaslAction, CaslSubjectType]>(
            parsed.rules as any,
          );
          return { ability, permissions: parsed.rules };
        }
      } catch {
        // fallback rebuild
      }
    }

    const result = await this.buildForUser(user);

    await this.safeRedisSetex(
      cacheKey,
      this.TTL_SECONDS,
      JSON.stringify({ v: CACHE_VERSION, rules: result.permissions }),
    );

    return result;
  }

  private cacheKeyFor(user: CaslUser): string {
    if (user.type === 'kine' && user.profileId) {
      return RedisKeys.permsProfile(user.profileId);
    }
    return RedisKeys.perms(user.sub);
  }

  private async buildForUser(
    user: CaslUser,
  ): Promise<{ ability: AppAbility; permissions: FlatPermissions }> {
    if (user.roleSlug === 'SUPER_ADMIN') {
      const permissions: FlatPermissions = [
        { action: 'manage', subject: 'all', conditions: null },
      ];
      const ability = createMongoAbility<[CaslAction, CaslSubjectType]>(
        permissions as any,
      );
      return { ability, permissions };
    }

    // Build via AbilityBuilder so CASL semantics (cannot precedence, etc.)
    // stay identical to before. We mirror every can/cannot into the
    // `grants` / `denies` maps so the wire array matches `ability.rules`.
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    // Map key: `${subject}|${action}`. One row per (subject, action) pair.
    const grants = new Map<string, PermissionRule>();
    const denies = new Map<string, PermissionRule>();
    // Tracks which (subject, action) pairs were granted as unrestricted, so
    // a later restricted grant for the same pair does not overwrite the
    // unrestricted one (mirrors prior `flat` behaviour).
    const unrestricted = new Set<string>();

    const role = await this.loadRoleWithPermissions(user.roleSlug);
    if (!role) {
      return { ability: build(), permissions: [] };
    }

    let allMappings = [...(role.permissionIds as any[])];

    if (role.parentRoleId) {
      const parentRole = await this.roleModel
        .findById(role.parentRoleId)
        .populate({
          path: 'permissionIds.permission',
          populate: [{ path: 'moduleId' }, { path: 'actionIds' }],
        })
        .lean()
        .exec();

      if (parentRole) {
        allMappings = this.mergePermissions(
          parentRole.permissionIds as any[],
          role.permissionIds as any[],
        );
      }
    }

    for (const mapping of allMappings) {
      const permission = mapping.permission;
      if (!permission || !permission.moduleId || !permission.actionIds)
        continue;

      const moduleDoc = permission.moduleId;
      if (!moduleDoc || !moduleDoc.slug) continue;

      const subject = moduleDoc.slug as CaslSubjectType;
      const actions = (permission.actionIds as any[])
        .filter((a: any) => a && a.slug)
        .map((a: any) => a.slug as CaslAction);

      if (actions.length === 0) continue;

      const resolvedPermissionConditions = this.resolvePlaceholders(
        permission.conditions,
        user,
      );

      const caslConditions: Record<string, any> = {
        ...(resolvedPermissionConditions ?? {}),
      };
      if (user.cabinetId) {
        caslConditions.cabinetId = user.cabinetId;
      }

      can(actions, subject, caslConditions);

      const isRestricted = !!resolvedPermissionConditions;
      const wireConditions = Object.keys(caslConditions).length
        ? caslConditions
        : null;

      for (const action of actions) {
        const key = `${subject}|${action}`;
        if (unrestricted.has(key) && isRestricted) continue;
        grants.set(key, { action, subject, conditions: wireConditions });
        if (!isRestricted) unrestricted.add(key);
      }
    }

    await this.applyOverrides(user, can, cannot, grants, denies, unrestricted);

    const permissions = this.serialize(grants, denies);
    return { ability: build(), permissions };
  }

  /**
   * Apply profile.customPermissionOverrides on top of role rules. Runs
   * after can(...) calls from the role so a `cannot` takes precedence
   * (CASL evaluates cannot after can). Admins/patients pass through
   * unchanged because they never carry overrides.
   */
  private async applyOverrides(
    user: CaslUser,
    can: AbilityBuilder<AppAbility>['can'],
    cannot: AbilityBuilder<AppAbility>['cannot'],
    grants: Map<string, PermissionRule>,
    denies: Map<string, PermissionRule>,
    unrestricted: Set<string>,
  ): Promise<void> {
    const overrides = user.customPermissionOverrides ?? [];
    if (overrides.length === 0) return;

    const ids = overrides.map(
      (o) => new Types.ObjectId(String(o.permissionId)),
    );
    const perms = await this.permissionModel
      .find({ _id: { $in: ids }, isActive: true, deletedAt: null })
      .populate('moduleId')
      .populate('actionIds')
      .lean()
      .exec();

    const permsById = new Map<string, any>();
    for (const perm of perms) {
      permsById.set(String(perm._id), perm);
    }

    for (const override of overrides) {
      const perm = permsById.get(String(override.permissionId));
      if (!perm) continue;

      const moduleDoc = perm.moduleId;
      const actions = ((perm.actionIds as any[]) ?? [])
        .filter((action: any) => action && action.slug)
        .map((action: any) => action.slug as CaslAction);

      if (!moduleDoc?.slug || actions.length === 0) continue;
      const subject = moduleDoc.slug as CaslSubjectType;

      const resolved = this.resolvePlaceholders(perm.conditions, user);
      const caslConditions: Record<string, any> = { ...(resolved ?? {}) };
      if (user.cabinetId) {
        caslConditions.cabinetId = user.cabinetId;
      }

      if (override.granted) {
        can(actions, subject, caslConditions);
        const wireConditions = Object.keys(caslConditions).length
          ? caslConditions
          : null;
        const isRestricted = !!resolved;
        for (const action of actions) {
          const key = `${subject}|${action}`;
          // Override always wins: replace whatever the role provided.
          grants.set(key, { action, subject, conditions: wireConditions });
          if (isRestricted) unrestricted.delete(key);
          else unrestricted.add(key);
          // A prior deny on this exact pair is no longer relevant.
          denies.delete(key);
        }
      } else {
        cannot(actions, subject);
        for (const action of actions) {
          const key = `${subject}|${action}`;
          // Drop any role-granted entry, then record the explicit deny so
          // the frontend can distinguish "revoked" from "never granted".
          grants.delete(key);
          unrestricted.delete(key);
          denies.set(key, {
            action,
            subject,
            conditions: null,
            inverted: true,
          });
        }
      }
    }
  }

  private serialize(
    grants: Map<string, PermissionRule>,
    denies: Map<string, PermissionRule>,
  ): FlatPermissions {
    const out: PermissionRule[] = [...grants.values(), ...denies.values()];
    out.sort((a, b) => {
      if (a.subject !== b.subject) return a.subject < b.subject ? -1 : 1;
      if (a.action !== b.action) return a.action < b.action ? -1 : 1;
      // inverted last for the same pair.
      return Number(!!a.inverted) - Number(!!b.inverted);
    });
    return out;
  }

  private resolvePlaceholders(
    conditions: Record<string, any> | null | undefined,
    user: CaslUser,
  ): Record<string, any> | null {
    if (!conditions || Object.keys(conditions).length === 0) return null;
    const substitutions: Record<string, any> = {
      $userId: user.sub,
      $cabinetId: user.cabinetId,
      $roleSlug: user.roleSlug,
      $profileId: user.profileId,
    };
    const resolve = (value: any): any => {
      if (typeof value === 'string' && value in substitutions) {
        return substitutions[value];
      }
      if (Array.isArray(value)) return value.map(resolve);
      if (value && typeof value === 'object') {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(value)) out[k] = resolve(v);
        return out;
      }
      return value;
    };
    return resolve(conditions);
  }

  private async loadRoleWithPermissions(roleSlug: string) {
    return this.roleModel
      .findOne({ slug: roleSlug, isActive: true })
      .populate({
        path: 'permissionIds.permission',
        populate: [{ path: 'moduleId' }, { path: 'actionIds' }],
      })
      .lean()
      .exec();
  }

  private mergePermissions(parentMappings: any[], childMappings: any[]): any[] {
    const merged = new Map<string, any>();

    for (const mapping of parentMappings) {
      const perm = mapping.permission;
      if (!perm) continue;
      const key = perm._id?.toString() ?? perm.toString();
      merged.set(key, { ...mapping });
    }

    for (const mapping of childMappings) {
      const perm = mapping.permission;
      if (!perm) continue;
      const key = perm._id?.toString() ?? perm.toString();
      merged.set(key, { ...mapping });
    }

    return Array.from(merged.values());
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.safeRedisDel(RedisKeys.perms(userId));
  }

  async invalidateProfile(profileId: string): Promise<void> {
    await this.safeRedisDel(RedisKeys.permsProfile(profileId));
  }

  async invalidateAll(): Promise<void> {
    try {
      // Keys are prefixed when REDIS_KEY_PREFIX is set, so the scan pattern
      // must include the same prefix to avoid wiping neighbour envs.
      const prefix = RedisKeys.perms('').replace(/:$/, '');
      const keys = await this.redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch {}
  }

  private async safeRedisGet(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch {
      return null;
    }
  }

  private async safeRedisSetex(
    key: string,
    seconds: number,
    value: string,
  ): Promise<void> {
    try {
      await this.redis.setex(key, seconds, value);
    } catch {}
  }

  private async safeRedisDel(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {}
  }
}
