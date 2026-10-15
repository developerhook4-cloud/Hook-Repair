export interface RoleResponse {
  id: string;
  name: string;
  permissions: string[];
  active: boolean;
}

export interface RoleRequest {
  name: string;
  permissions: string[];
}

export interface RoleDto {
  name: string;
  permissions: string[];
}
