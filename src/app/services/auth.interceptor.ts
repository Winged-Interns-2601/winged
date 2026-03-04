import {
  HttpEvent, HttpRequest, HttpErrorResponse, HttpHandlerFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const token = localStorage.getItem('TOKEN');

  // don't attach to auth endpoints (login/register)
  if (req.url.includes('/api/auth')) {
    return next(req).pipe(
      catchError(err => handleError(err, router))
    );
  }

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError(err => handleError(err, router))
  );
};

function handleError(err: any, router: Router) {
  if (err instanceof HttpErrorResponse && err.status === 401) {
    // token expired / invalid — clear all auth data and redirect to login
    localStorage.removeItem('TOKEN');
    localStorage.removeItem('LOGGED_IN_USER');
    localStorage.removeItem('CURRENT_USER');
    localStorage.removeItem('CURRENT_USER_EMAIL');
    // optional: show toast before redirect
    router.navigate(['/login']);
  }
  return throwError(() => err);
}