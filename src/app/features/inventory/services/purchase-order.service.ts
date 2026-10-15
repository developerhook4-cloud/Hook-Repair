import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrderRequest, PurchaseOrderResponse } from '../models/purchase-order.dto';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = import.meta.env.NG_APP_API_URL;

  getAll(): Observable<PurchaseOrderResponse[]> {
    return this.http.get<PurchaseOrderResponse[]>(this.endpoint());
  }

  getById(id: string): Observable<PurchaseOrderResponse> {
    return this.http.get<PurchaseOrderResponse>(`${this.endpoint()}/${id}`);
  }

  create(request: PurchaseOrderRequest): Observable<PurchaseOrderResponse> {
    return this.http.post<PurchaseOrderResponse>(this.endpoint(), request);
  }

  private endpoint(): string {
    const organizationId = this.authService.currentUser()?.user.organizationId;

    if (!organizationId) {
      throw new Error('An authenticated organization is required to access products.');
    }

    return `${this.apiUrl}/api/${organizationId}/purchase-orders`;
  }
}
