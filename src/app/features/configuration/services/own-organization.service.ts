import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  OrganizationResponse,
  SaveOrganizationRequest,
} from '../../organizations/models/organization.dto';
import { Observable } from 'rxjs';
import { UpdateOwnOrganizationRequest } from '../models/organization.dto';

@Injectable({
  providedIn: 'root',
})
export class OwnOrganizationService {
  private http = inject(HttpClient);
  private apiUrl = import.meta.env.NG_APP_API_URL;
  private readonly endpoint = `${this.apiUrl}/api/organizations/mine`;

  get(): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(this.endpoint);
  }

  update(organization: UpdateOwnOrganizationRequest): Observable<OrganizationResponse> {
    return this.http.put<OrganizationResponse>(`${this.endpoint}`, organization);
  }
}
