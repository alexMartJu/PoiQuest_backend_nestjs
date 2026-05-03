import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationResponse } from '../dto/responses/notification.response.dto';

export class NotificationMapper {
  static toResponse(entity: NotificationEntity): NotificationResponse {
    const dto = new NotificationResponse();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.message = entity.message;
    dto.notificationType = entity.notificationType;
    dto.isRead = entity.isRead;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toResponseList(entities: NotificationEntity[]): NotificationResponse[] {
    return entities.map(NotificationMapper.toResponse);
  }
}
