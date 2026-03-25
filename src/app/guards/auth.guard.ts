import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // 🔥 Prevent flicker - check if auth is still loading
  if (authService.isCheckingAuth()) {
    console.log('🔄 Auth check in progress...');
    return router.createUrlTree(['/login']);
  }

  const token = localStorage.getItem('TOKEN');
  let role = null;

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  // Extract role from JWT token and check expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // ⛔ Check token expiry
    if (payload.exp * 1000 < Date.now()) {
      console.log('Token expired, clearing storage');
      localStorage.clear();
      authService.logout();
      return router.createUrlTree(['/login']);
    }
    
    role = payload.role;
  } catch (error) {
    console.error('Invalid token format:', error);
    localStorage.clear();
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  const expectedRole = route.data?.['role'];

  if (expectedRole && expectedRole !== role) {
    console.log(`Access denied: Expected ${expectedRole}, but user is ${role}`);
    return router.createUrlTree(['/login']);
  }

  return true;
};