import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

interface JwtPayload {
  sub?: string;
  type?: 'kine' | 'patient' | 'admin';
  cabinetId?: string;
  roleSlug?: string;
}


@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantCtx: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req?.user;

    if (user?.sub && user?.roleSlug && user?.type) {
      this.tenantCtx.set({
        userId: user.sub,
        userType: user.type,
        cabinetId: user.cabinetId ?? '',
        roleSlug: user.roleSlug,
      });
    }

    return next.handle();
  }
}
