import { inject, Injectable } from '@angular/core';
import { ProductMutationResponse, ProductRequest, ProductResponse } from '../models/product.dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = import.meta.env.NG_APP_API_URL;

  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.endpoint());
  }

  getById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.endpoint()}/${id}`);
  }

  create(request: ProductRequest): Observable<ProductMutationResponse> {
    return this.http.post<ProductMutationResponse>(this.endpoint(), request);
  }

  update(id: string, request: ProductRequest): Observable<ProductMutationResponse> {
    return this.http.put<ProductMutationResponse>(`${this.endpoint()}/${id}`, request);
  }

  updateStatus(id: string, active: boolean): Observable<ProductMutationResponse> {
    return this.http.patch<ProductMutationResponse>(`${this.endpoint()}/${id}/status`, { active });
  }

  private endpoint(): string {
    const organizationId = this.authService.currentUser()?.user.organizationId;

    if (!organizationId) {
      throw new Error('An authenticated organization is required to access products.');
    }

    return `${this.apiUrl}/api/${organizationId}/products`;
  }
}
