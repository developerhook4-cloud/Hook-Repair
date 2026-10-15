import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SaveUserRequest, UpdateProfileRequest, UserResponse } from '../models/user.dto';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = import.meta.env.NG_APP_API_URL;
  private get orgId() {
    return this.authService.currentUser()?.user.organizationId;
  }

  private get endpoint() {
    return `${this.apiUrl}/api/${this.orgId}/users`;
  }

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.endpoint);
  }

  create(user: SaveUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.endpoint, user);
  }

  update(user: SaveUserRequest, userId: string): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.endpoint}/${userId}`, user);
  }

  updateStatus(userId: string, active: boolean): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.endpoint}/${userId}/status`, { active });
  }

  updateProfile(user: UpdateProfileRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/api/users/me`, user);
  }
}
