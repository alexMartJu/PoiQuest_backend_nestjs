import { ProfileEntity } from '../../domain/entities/profile.entity';
import { ProfileResponse } from '../dto/responses/profile.response.dto';

export class ProfileMapper {
  static toResponse(profile: ProfileEntity): ProfileResponse {
    return {
      uuid: profile.uuid,
      name: profile.name ?? null,
      lastname: profile.lastname ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      bio: profile.bio ?? null,
      totalPoints: profile.totalPoints,
      level: profile.level,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Devuelve un resumen ligero del perfil utilizado por User responses.
   * No importa tipos de usuario para evitar dependencias circulares.
   */
  static toSummaryResponse(profile: ProfileEntity) {
    return {
      uuid: profile.uuid,
      name: profile.name ?? null,
      lastname: profile.lastname ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      level: profile.level,
      totalPoints: profile.totalPoints,
    };
  }
}
