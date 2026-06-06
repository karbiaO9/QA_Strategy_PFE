import { Schema } from 'mongoose';
import { TenantContextService } from '../context/tenant-context.service';

const CABINET_FIELD = 'cabinetId';

const READ_HOOKS = [
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndRemove',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'distinct',
] as const;

const WRITE_HOOKS = [
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
] as const;

export function buildTenantScopePlugin(tenantCtx: TenantContextService) {
  return function tenantScopePlugin(schema: Schema): void {
    const hasCabinet = schema.path(CABINET_FIELD);
    if (!hasCabinet) return;

    for (const hook of READ_HOOKS) {
      schema.pre(hook as any, function (this: any) {
        applyTenantFilter(this, tenantCtx);
      });
    }

    for (const hook of WRITE_HOOKS) {
      schema.pre(hook as any, function (this: any) {
        applyTenantFilter(this, tenantCtx);
      });
    }

    schema.pre('aggregate', function (this: any) {
      const cabinetId = resolveCabinetId(this.options, tenantCtx);
      if (!cabinetId) return;
      const pipeline = this.pipeline();
      pipeline.unshift({ $match: { [CABINET_FIELD]: cabinetId } });
    });

    schema.pre('insertMany', function (this: any, next: any, docs: any) {
      const cabinetId = resolveCabinetId(undefined, tenantCtx);
      if (!cabinetId) return next();
      if (Array.isArray(docs)) {
        for (const doc of docs) {
          if (doc) doc[CABINET_FIELD] = cabinetId;
        }
      }
      next();
    });

    schema.pre('save', function (this: any, next: any) {
      if (!this.isNew) return next();
      const saveOptions = this.$__?.saveOptions as
        | Record<string, any>
        | undefined;
      const cabinetId = resolveCabinetId(saveOptions, tenantCtx);
      if (cabinetId) this[CABINET_FIELD] = cabinetId;
      next();
    });
  };
}

function applyTenantFilter(query: any, tenantCtx: TenantContextService): void {
  const cabinetId = resolveCabinetId(query.getOptions?.(), tenantCtx);
  if (!cabinetId) return;

  const filter = query.getFilter();
  if (filter[CABINET_FIELD] === undefined) {
    query.where({ [CABINET_FIELD]: cabinetId });
  }

  const update = query.getUpdate?.();
  if (update) stripCabinetFromUpdate(update);
}

function stripCabinetFromUpdate(update: any): void {
  if (update[CABINET_FIELD] !== undefined) delete update[CABINET_FIELD];
  if (update.$set && update.$set[CABINET_FIELD] !== undefined) {
    delete update.$set[CABINET_FIELD];
  }
  if (update.$setOnInsert && update.$setOnInsert[CABINET_FIELD] !== undefined) {
    delete update.$setOnInsert[CABINET_FIELD];
  }
}

function resolveCabinetId(
  queryOptions: Record<string, any> | undefined,
  tenantCtx: TenantContextService,
): string | undefined {
  if (queryOptions?.bypassTenantScope === true) return undefined;
  if (tenantCtx.isBypassed()) return undefined;
  if (tenantCtx.isSuperAdmin()) return undefined;
  return tenantCtx.getCabinetId();
}
