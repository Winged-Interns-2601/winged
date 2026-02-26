import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('TOKEN');

    // don't attach to auth endpoints (login/register)
    if (req.url.endsWith('/login') || req.url.endsWith('/register')) {
      return next.handle(req).pipe(
        catchError(err => this.handleError(err))
      );
    }

    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(cloned).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(err: any) {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      // token expired / invalid — clear and redirect to login
      localStorage.removeItem('TOKEN');
      localStorage.removeItem('LOGGED_IN_USER');
      localStorage.removeItem('CURRENT_USER');
      // optional: show toast before redirect
      this.router.navigate(['/login']);
    }
    return throwError(() => err);
  }
}