export enum CustomerType {
  Public = 0,
  Distributor = 1,
}

export interface AddressDto {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postCode?: string | null;
  country?: string | null;
}

export interface ClientRequest {
  name?: string | null;
  customerType: CustomerType;
  phone1?: string | null;
  phone2?: string | null;
  legalName?: string | null;
  email?: string | null;
  address?: AddressDto | null;
  titularName?: string | null;
  authorizedPeople?: string[] | null;
  rfc?: string | null;
  taxRegime?: string | null;
  expenseType?: string | null;
}

export interface ClientResponse extends ClientRequest {
  id: string;
  name: string;
  phone1: string;
  active: boolean;
}

export interface ClientMutationResponse {
  id: string;
  message: string;
}