import { LevelEntity } from '../../domain/entities/level.entity';
import { LevelResponse } from '../dto/responses/level.response.dto';

export class LevelMapper {
  static toResponse(level: LevelEntity): LevelResponse {
    return {
      uuid: level.uuid,
      level: level.level,
      title: level.title,
      minPoints: level.minPoints,
      discount: level.discount,
      reward: level.reward ?? null,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    };
  }

  static toResponseList(levels: LevelEntity[]): LevelResponse[] {
    return levels.map(LevelMapper.toResponse);
  }
}
