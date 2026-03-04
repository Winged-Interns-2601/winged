import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {

  const router = inject(Router);

  const token = localStorage.getItem('TOKEN');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};