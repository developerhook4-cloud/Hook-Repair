import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OrganizationResponse,
  SaveOrganizationRequest,
  SaveUserRequest,
  UserDto,
} from '../models/organization.dto';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private http = inject(HttpClient);
  private apiUrl = import.meta.env.NG_APP_API_URL;
  private readonly endpoint = `${this.apiUrl}/api/organizations`;

  getAll(): Observable<OrganizationResponse[]> {
    return this.http.get<OrganizationResponse[]>(this.endpoint);
  }

  create(organization: SaveOrganizationRequest): Observable<OrganizationResponse> {
    return this.http.post<OrganizationResponse>(this.endpoint, organization);
  }

  update(id: string, organization: SaveOrganizationRequest): Observable<OrganizationResponse> {
    return this.http.put<OrganizationResponse>(`${this.endpoint}/${id}`, organization);
  }

  updateStatus(id: string, active: boolean): Observable<OrganizationResponse> {
    return this.http.patch<OrganizationResponse>(`${this.endpoint}/${id}/status`, { active });
  }

  createOrganizationUser(organizationId: string, user: SaveUserRequest): Observable<any> {
    return this.http.post(`${this.endpoint}/${organizationId}/users`, user);
  }

  updateOrganizationUser(
    organizationId: string,
    userId: string,
    user: SaveUserRequest,
  ): Observable<any> {
    return this.http.put(`${this.endpoint}/${organizationId}/users/${userId}`, user);
  }

  getOrganizationUsers(organizationId: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.endpoint}/${organizationId}/users`);
  }

  updateOrganizationUserStatus(
    organizationId: string,
    userId: string,
    active: boolean,
  ): Observable<any> {
    return this.http.patch(`${this.endpoint}/${organizationId}/users/${userId}/status`, { active });
  }
}
