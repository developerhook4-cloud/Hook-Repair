import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import {
  CatalogItemResponse,
  CatalogMutationResponse,
  CatalogNameRequest,
  CategoryResponse,
  ModelRequest,
  ModelResponse,
  SaveServiceRequest,
  ServiceMutationResponse,
  ServiceResponse,
  UpdateServiceStatusRequest,
} from '../models/catalog.dto';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = import.meta.env.NG_APP_API_URL;

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.endpoint('categories'));
  }

  getCategoryById(id: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.endpoint('categories')}/${id}`);
  }

  createCategory(request: CatalogNameRequest): Observable<CatalogMutationResponse> {
    return this.http.post<CatalogMutationResponse>(this.endpoint('categories'), request);
  }

  updateCategory(id: string, request: CatalogNameRequest): Observable<CatalogMutationResponse> {
    return this.http.put<CatalogMutationResponse>(`${this.endpoint('categories')}/${id}`, request);
  }

  updateCategoryStatus(id: string, active: boolean): Observable<CatalogMutationResponse> {
    return this.http.patch<CatalogMutationResponse>(`${this.endpoint('categories')}/${id}/status`, {
      active,
    });
  }

  getBrands(): Observable<CatalogItemResponse[]> {
    return this.http.get<CatalogItemResponse[]>(this.endpoint('brands'));
  }

  getBrandById(id: string): Observable<CatalogItemResponse> {
    return this.http.get<CatalogItemResponse>(`${this.endpoint('brands')}/${id}`);
  }

  createBrand(request: CatalogNameRequest): Observable<CatalogMutationResponse> {
    return this.http.post<CatalogMutationResponse>(this.endpoint('brands'), request);
  }

  updateBrand(id: string, request: CatalogNameRequest): Observable<CatalogMutationResponse> {
    return this.http.put<CatalogMutationResponse>(`${this.endpoint('brands')}/${id}`, request);
  }

  updateBrandStatus(id: string, active: boolean): Observable<CatalogMutationResponse> {
    return this.http.patch<CatalogMutationResponse>(`${this.endpoint('brands')}/${id}/status`, {
      active,
    });
  }

  getModels(): Observable<ModelResponse[]> {
    return this.http.get<ModelResponse[]>(this.endpoint('models'));
  }

  getModelById(id: string): Observable<ModelResponse> {
    return this.http.get<ModelResponse>(`${this.endpoint('models')}/${id}`);
  }

  createModel(request: ModelRequest): Observable<CatalogMutationResponse> {
    return this.http.post<CatalogMutationResponse>(this.endpoint('models'), request);
  }

  updateModel(id: string, request: ModelRequest): Observable<CatalogMutationResponse> {
    return this.http.put<CatalogMutationResponse>(`${this.endpoint('models')}/${id}`, request);
  }

  updateModelStatus(id: string, active: boolean): Observable<CatalogMutationResponse> {
    return this.http.patch<CatalogMutationResponse>(`${this.endpoint('models')}/${id}/status`, {
      active,
    });
  }

  getServices(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(this.endpoint('services'));
  }

  getServiceById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.endpoint('services')}/${id}`);
  }

  createService(request: SaveServiceRequest): Observable<ServiceMutationResponse> {
    return this.http.post<ServiceMutationResponse>(this.endpoint('services'), request);
  }

  updateService(id: string, request: SaveServiceRequest): Observable<ServiceMutationResponse> {
    return this.http.put<ServiceMutationResponse>(`${this.endpoint('services')}/${id}`, request);
  }

  updateServiceStatus(id: string, active: boolean): Observable<ServiceMutationResponse> {
    const request: UpdateServiceStatusRequest = { active };

    return this.http.patch<ServiceMutationResponse>(
      `${this.endpoint('services')}/${id}/status`,
      request,
    );
  }

  private endpoint(resource: string): string {
    const organizationId = this.authService.currentUser()?.user.organizationId;

    if (!organizationId) {
      throw new Error('An authenticated organization is required to access catalogs.');
    }

    return `${this.apiUrl}/api/${organizationId}/${resource}`;
  }
}
