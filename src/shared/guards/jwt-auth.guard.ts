import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { JwtService } from '@nestjs/jwt';
  import { AuthGuard } from '@nestjs/passport';
  import { ROLES_KEY } from '../decorators/role.decorator';
  
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
      private readonly reflector: Reflector,
      private readonly jwtService: JwtService,
    ) {
      super();
    }
  
    async canActivate(context: ExecutionContext) {
      const canActivate = await super.canActivate(context);
      if (!canActivate) {
        return false;
      }
  
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
  
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
  
      const payload = this.jwtService.verify(token);

      const userRoles = payload.permissions || [];

      const hasRole = () => {
        const normalizedUserRoles = userRoles.map(role => role.toLowerCase());
        const normalizedRequiredRoles = requiredRoles.map(role => role.toLowerCase());
      
        return normalizedUserRoles.some(role => normalizedRequiredRoles.includes(role));
      };
      
      if (!hasRole()) {
        throw new UnauthorizedException('Insufficient permissions');
      }
      
  
      return true;
    }
  }