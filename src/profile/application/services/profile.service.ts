import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { NotFoundError } from '../../../shared/errors/not-found.error';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

  // Obtiene el perfil del usuario autenticado por su userId
  async getMyProfile(userId: number): Promise<ProfileEntity> {
    return await this.findProfileByUserIdOrFail(userId);
  }

  // Actualiza el perfil del usuario autenticado (name, lastname, bio)
  async updateMyProfile(userId: number, dto: UpdateProfileDto): Promise<ProfileEntity> {
    const profile = await this.findProfileByUserIdOrFail(userId);

    // Actualiza solo los campos proporcionados
    if (dto.name !== undefined) profile.name = dto.name;
    if (dto.lastname !== undefined) profile.lastname = dto.lastname;
    if (dto.bio !== undefined) profile.bio = dto.bio;

    return await this.profileRepo.save(profile);
  }

  // Actualiza el avatarUrl del perfil del usuario autenticado
  async updateMyAvatar(userId: number, avatarUrl: string): Promise<ProfileEntity> {
    const profile = await this.findProfileByUserIdOrFail(userId);
    profile.avatarUrl = avatarUrl;
    return await this.profileRepo.save(profile);
  }

  // ============ Funciones auxiliares ============

  // Busca un perfil por userId o lanza NotFoundError
  private async findProfileByUserIdOrFail(userId: number): Promise<ProfileEntity> {
    const profile = await this.profileRepo.findOneByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil no encontrado');
    }
    return profile;
  }
}
