export interface CatalogItemResponse {
  id: string;
  name: string;
  active: boolean;
}

export interface CategoryResponse extends CatalogItemResponse {
  icon: string;
}

export interface ModelResponse extends CatalogItemResponse {
  brandName: string;
  brandId: string;
}

export interface CatalogNameRequest {
  name: string;
}

export interface CategoryRequest extends CatalogNameRequest {
  icon: string;
}

export interface ModelRequest extends CatalogNameRequest {
  brandId: string;
}

export interface CatalogMutationResponse {
  id: string;
  message: string;
}

export interface SaveServiceRequest {
  name: string;
  description: string;
  categoryId?: string | null;
  brandId?: string | null;
  modelId?: string | null;
  retailPrice: number;
  publicPrice: number;
  distributorPrice: number;
}

export interface ServiceResponse extends SaveServiceRequest {
  id: string;
  active: boolean;
}

export interface ServiceMutationResponse {
  id: string;
  message: string;
}

export interface UpdateServiceStatusRequest {
  active: boolean;
}
