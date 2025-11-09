// Payload mínimo pasado por el decorador @CurrentUser
export interface CurrentUserPayload {
  userId: number;
  email: string;
  roles: string[];
}
