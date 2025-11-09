import { Request } from 'express';
import { UserEntity } from '../../../users/domain/entities/user.entity';

// Request enriquecida con la entidad de usuario autenticado
export interface RequestWithUser extends Request {
  user: UserEntity;
}
