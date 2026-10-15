import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { RoleRequest, RoleResponse } from '../models/roles.dto';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private session = this.authService.currentUser();
  private orgId = this.session?.user.organizationId;
  private apiUrl = import.meta.env.NG_APP_API_URL;
  private endpoint = `${this.apiUrl}/api/${this.orgId}/roles`;

  getAll(): Observable<RoleResponse[]> {
    return this.http
      .get<any>(this.endpoint)
      .pipe(map((response) => response.roles || response.data || response.items || []));
  }

  create(role: RoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(this.endpoint, role);
  }

  update(role: RoleRequest, roleId: string): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.endpoint}/${roleId}`, role);
  }

  updateStatus(roleId: string, active: boolean): Observable<RoleResponse> {
    return this.http.patch<RoleResponse>(`${this.endpoint}/${roleId}/status`, { active });
  }

  getAllPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.endpoint}/permissions`);
  }
}
