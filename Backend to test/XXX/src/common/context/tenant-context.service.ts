import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export interface TenantContext {
  userId: string;
  userType: 'kine' | 'patient' | 'admin';
  cabinetId: string;
  roleSlug: string;
}

const CTX_KEY = 'tenant';
const BYPASS_KEY = 'tenant:bypass';


@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  set(ctx: TenantContext): void {
    if (!this.cls.isActive()) return;
    this.cls.set(CTX_KEY, ctx);
  }

  get(): TenantContext | undefined {
    if (!this.cls.isActive()) return undefined;
    return this.cls.get<TenantContext | undefined>(CTX_KEY);
  }

  getCabinetId(): string | undefined {
    return this.get()?.cabinetId;
  }

  getUserId(): string | undefined {
    return this.get()?.userId;
  }

  getRoleSlug(): string | undefined {
    return this.get()?.roleSlug;
  }

  isSuperAdmin(): boolean {
    return this.getRoleSlug() === 'SUPER_ADMIN';
  }

  setBypass(on: boolean): void {
    if (!this.cls.isActive()) return;
    this.cls.set(BYPASS_KEY, on);
  }

  isBypassed(): boolean {
    if (!this.cls.isActive()) return false;
    return this.cls.get<boolean | undefined>(BYPASS_KEY) === true;
  }
}
