import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthResponseDto } from '../models/auth-response.dto';
import { LoginRequestDto } from '../models/login-request.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = import.meta.env.NG_APP_API_URL;
  private refreshRequest$?: Observable<AuthResponseDto>;

  public currentUserSignal = signal<AuthResponseDto | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  login(data: LoginRequestDto) {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}/api/auth/login`, data, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.currentUserSignal.set(response)));
  }

  logout() {
    return this.http
      .post(`${this.apiUrl}/api/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearSession()));
  }

  refreshToken(): Observable<AuthResponseDto> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.http
        .post<AuthResponseDto>(
          `${this.apiUrl}/api/auth/refresh-token`,
          {},
          { withCredentials: true },
        )
        .pipe(
          tap((response) => this.currentUserSignal.set(response)),
          finalize(() => {
            this.refreshRequest$ = undefined;
          }),
          shareReplay(1),
        );
    }

    return this.refreshRequest$;
  }

  clearSession(): void {
    this.currentUserSignal.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getDecodedToken(): any | null {
    const user = this.currentUser();
    if (!user?.token) return null;

    try {
      return jwtDecode(user.token);
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const decoded = this.getDecodedToken();

    return (
      decoded?.role ||
      decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  }

  hasPermission(requiredPermission: string): boolean {
    const session = this.currentUser();
    if (!session?.user?.permissions) return false;
    if (session.user.permissions.includes('*')) return true;
    return session.user.permissions.includes(requiredPermission);
  }
}
