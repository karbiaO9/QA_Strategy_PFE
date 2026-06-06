import { JwtUser } from '../decorators/current-user.decorator';


export function resolveCabinetScope(user: JwtUser): string | null {
  if (user.roleSlug === 'SUPER_ADMIN') return null;
  return user.cabinetId;
}
