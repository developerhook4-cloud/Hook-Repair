export interface SupplierRequest {
  name?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
}

export interface SupplierResponse extends SupplierRequest {
  id: string;
  name: string;
  phone1: string;
  email: string;
  active: boolean;
}

export interface SupplierMutationResponse {
  id: string;
  message: string;
}