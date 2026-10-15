export interface UpdateOwnOrganizationRequest {
  name: string;
  email: string;
  phone1?: string;
  phone2?: string;
  website?: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    postCode?: string;
    country?: string;
  };
}
