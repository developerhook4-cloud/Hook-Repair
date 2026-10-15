export interface OrganizationAddressDto {
  address?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country?: string;
}

export interface SaveOrganizationRequest {
  name: string;
  email: string;
  active: boolean;
  phone?: string;
  phone2?: string;
  website?: string;
  address?: OrganizationAddressDto;
}

export interface OrganizationResponse extends SaveOrganizationRequest {
  id: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

export interface SaveUserRequest {
  name: string;
  email: string;
  password?: string;
  roleId?: string;
}
