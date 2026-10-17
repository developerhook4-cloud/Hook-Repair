import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { AuthService } from './features/auth/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    // Al abrir o recargar la app, intenta recuperar la sesion con la cookie del refresh token.
    // Si no hay sesion (o la cookie expiro), continua normal y el guard envia al login.
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return firstValueFrom(authService.refreshToken().pipe(catchError(() => of(null))));
    }),
  ],
};
