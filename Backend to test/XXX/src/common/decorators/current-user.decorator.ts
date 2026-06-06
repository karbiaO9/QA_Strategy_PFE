import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  sub: string;         
  email: string;
  type: string;        
  cabinetId: string;   
  roleSlug: string;    
  iat?: number;
  exp?: number;
}


export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
