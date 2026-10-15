export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roleId: string;
    role: string;
    permissions: string[];
    organizationId: string;
  };
}
