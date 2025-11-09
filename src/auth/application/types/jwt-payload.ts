export interface JwtPayload {
  sub: number; // porque es userId
  email: string;
  roles: string[];
  tokenVersion: number;
}
