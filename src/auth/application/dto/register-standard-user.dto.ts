export interface RegisterStandardUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
}
