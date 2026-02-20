import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import {
  AnalyticsRepository,
  OverviewStats,
  CategoryEventCount,
  MonthlyUserCount,
} from '../../../domain/repositories/analytics.repository';
import { UserEntity } from '../../../../users/domain/entities/user.entity';
import { EventEntity } from '../../../../events/domain/entities/event.entity';
import { EventCategoryEntity } from '../../../../events/domain/entities/event-category.entity';
import { PointOfInterestEntity } from '../../../../events/domain/entities/point-of-interest.entity';
import { UserStatus } from '../../../../users/domain/enums/user-status.enum';
import { EventStatus } from '../../../../events/domain/enums/event-status.enum';

@Injectable()
export class TypeormAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getOverviewStats(recentDays: number): Promise<OverviewStats> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const eventRepo = this.dataSource.getRepository(EventEntity);
    const poiRepo = this.dataSource.getRepository(PointOfInterestEntity);

    // Total de usuarios
    const totalUsers = await userRepo.count();

    // Usuarios activos
    const activeUsers = await userRepo.count({
      where: { status: UserStatus.ACTIVE },
    });

    // Usuarios recientes (últimos X días)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - recentDays);
    const recentUsers = await userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :recentDate', { recentDate })
      .getCount();

    // Total de eventos (sin eliminar)
    const totalEvents = await eventRepo.count({
      where: { deletedAt: IsNull() },
    });

    // Eventos activos (status active y no eliminados)
    const activeEvents = await eventRepo.count({
      where: {
        status: EventStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    });

    // Total de POIs (sin eliminar)
    const totalPois = await poiRepo.count({
      where: { deletedAt: IsNull() },
    });

    return {
      totalUsers,
      activeUsers,
      recentUsers,
      totalEvents,
      activeEvents,
      totalPois,
    };
  }

  async getEventsByCategory(): Promise<CategoryEventCount[]> {
    const results = await this.dataSource
      .getRepository(EventCategoryEntity)
      .createQueryBuilder('category')
      .leftJoin('category.events', 'event')
      .select('category.uuid', 'categoryUuid')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(CASE WHEN event.deletedAt IS NULL THEN event.id END)', 'eventCount')
      .where('category.deletedAt IS NULL')
      .groupBy('category.id')
      .orderBy('category.name', 'ASC')
      .getRawMany();

    return results.map((row) => ({
      categoryUuid: row.categoryUuid,
      categoryName: row.categoryName,
      eventCount: parseInt(row.eventCount, 10) || 0,
    }));
  }

  async getUsersByMonth(): Promise<MonthlyUserCount[]> {
    const results = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('user')
      .select('YEAR(user.createdAt)', 'year')
      .addSelect('MONTH(user.createdAt)', 'month')
      .addSelect('COUNT(user.id)', 'userCount')
      .groupBy('year')
      .addGroupBy('month')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    return results.map((row) => ({
      year: parseInt(row.year, 10),
      month: parseInt(row.month, 10),
      userCount: parseInt(row.userCount, 10) || 0,
    }));
  }
}
