import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { ClientMutationResponse, ClientRequest, ClientResponse } from '../models/client.dto';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = import.meta.env.NG_APP_API_URL;

  getAll(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(this.endpoint());
  }

  getById(id: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.endpoint()}/${id}`);
  }

  create(request: ClientRequest): Observable<ClientMutationResponse> {
    return this.http.post<ClientMutationResponse>(this.endpoint(), request);
  }

  update(id: string, request: ClientRequest): Observable<ClientMutationResponse> {
    return this.http.put<ClientMutationResponse>(`${this.endpoint()}/${id}`, request);
  }

  updateStatus(id: string, active: boolean): Observable<ClientMutationResponse> {
    return this.http.patch<ClientMutationResponse>(`${this.endpoint()}/${id}/status`, { active });
  }

  private endpoint(): string {
    const organizationId = this.authService.currentUser()?.user.organizationId;

    if (!organizationId) {
      throw new Error('An authenticated organization is required to access clients.');
    }

    return `${this.apiUrl}/api/${organizationId}/clients`;
  }
}
