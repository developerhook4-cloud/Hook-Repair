export interface UserResponse {
  name: string;
  email: string;
  roleId: string;
  role: string;
  permissions: string[];
  active: boolean;
}

export interface SaveUserRequest {
  name: string;
  email: string;
  password?: string;
  roleId: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  password?: string;
}
