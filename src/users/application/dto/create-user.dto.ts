export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  roleName: string;
  avatarUrl?: string;
  bio?: string;
}
