import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data['roles'] as string[] | undefined;
  
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const userRole = auth.getCurrentRole();
  
  if (userRole && allowedRoles.some(role => role.toLowerCase() === userRole.toLowerCase())) {
    return true;
  }

  // Redirigir al dashboard con mensaje de acceso denegado
  return router.createUrlTree(['/dashboard'], {
    queryParams: { acceso: 'denegado' }
  });
};