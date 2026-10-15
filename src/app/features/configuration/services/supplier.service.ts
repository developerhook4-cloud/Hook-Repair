import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import {
  SupplierMutationResponse,
  SupplierRequest,
  SupplierResponse,
} from '../models/supplier.dto';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = import.meta.env.NG_APP_API_URL;

  getAll(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(this.endpoint());
  }

  getById(id: string): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(`${this.endpoint()}/${id}`);
  }

  create(request: SupplierRequest): Observable<SupplierMutationResponse> {
    return this.http.post<SupplierMutationResponse>(this.endpoint(), request);
  }

  update(id: string, request: SupplierRequest): Observable<SupplierMutationResponse> {
    return this.http.put<SupplierMutationResponse>(`${this.endpoint()}/${id}`, request);
  }

  updateStatus(id: string, active: boolean): Observable<SupplierMutationResponse> {
    return this.http.patch<SupplierMutationResponse>(`${this.endpoint()}/${id}/status`, { active });
  }

  private endpoint(): string {
    const organizationId = this.authService.currentUser()?.user.organizationId;

    if (!organizationId) {
      throw new Error('An authenticated organization is required to access suppliers.');
    }

    return `${this.apiUrl}/api/${organizationId}/suppliers`;
  }
}
