import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAbility } from '../casl/casl-ability.factory';



export const CurrentAbility = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppAbility => {
    const request = ctx.switchToHttp().getRequest();
    return request.ability;
  },
);
