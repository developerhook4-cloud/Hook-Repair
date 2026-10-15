export interface ProductRequest {
  name?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  modelId?: string | null;
  supplierId?: string | null;
  upc?: string | null;
  imageUrl?: string | null;
  condition?: string | null;
  inStock?: number | null;
  stockWarning?: number | null;
  minimumReorderPoint?: number | null;
  price?: number | null;
  generalSalePrice?: number | null;
  distributorSalePrice?: number | null;
  isSerialized?: boolean | null;
  active?: boolean | null;
}

export interface ProductResponse extends ProductRequest {
  id: string;
  name: string;
  categoryName: string | null;
  brandName: string | null;
  modelName: string | null;
  modelNames: string[];
  supplierName: string | null;
  upc: string | null;
  inStock: number | null;
  price: number | null;
  isSerialized: boolean | null;
  serialNumbers: string[];
  active: boolean | null;
  status: string | null;
}

export interface ProductMutationResponse {
  id: string;
  message: string;
}
