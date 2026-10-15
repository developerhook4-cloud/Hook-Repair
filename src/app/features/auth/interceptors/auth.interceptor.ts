import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const authEndpoints = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh-token',
];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  const isAuthEndpoint = authEndpoints.some((endpoint) =>
    request.url.includes(endpoint),
  );

  if (isAuthEndpoint) {
    return next(request);
  }

  const token = authService.currentUser()?.token;
  const authenticatedRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(({ token: refreshedToken }) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`,
              },
            }),
          ),
        ),
        catchError((refreshError: unknown) => {
          authService.clearSession();

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};