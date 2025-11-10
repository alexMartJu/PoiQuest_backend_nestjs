import { UserEntity } from '../../domain/entities/user.entity';
import { RoleEntity } from '../../domain/entities/role.entity';
import { ProfileEntity } from '../../../profile/domain/entities/profile.entity';
import { UserResponse, RoleResponse } from '../dto/responses/user.response.dto';
import type { ProfileSummaryResponse } from '../../../profile/presentation/dto/responses/profile-summary.response.dto';
import { ProfileMapper } from '../../../profile/presentation/mappers/profile.mapper';

export class UserMapper {
  static toResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles ? user.roles.map(UserMapper.toRoleResponse) : [],
      profile: user.profile ? UserMapper.toProfileSummaryResponse(user.profile) : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponseList(list: UserEntity[]): UserResponse[] {
    return list.map(UserMapper.toResponse);
  }

  private static toRoleResponse(role: RoleEntity): RoleResponse {
    return {
      id: role.id,
      name: role.name,
    };
  }

  private static toProfileSummaryResponse(profile: ProfileEntity): ProfileSummaryResponse {
    // Reutiliza ProfileMapper para mantener un único lugar de transformación
    return ProfileMapper.toSummaryResponse(profile) as ProfileSummaryResponse;
  }
}
