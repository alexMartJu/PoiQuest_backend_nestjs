import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationRepository } from '../../../domain/repositories/gamification.repository';
import { AchievementEntity } from '../../../domain/entities/achievement.entity';
import { UserAchievementEntity } from '../../../domain/entities/user-achievement.entity';
import { ScanEntity } from '../../../../explore/domain/entities/scan.entity';
import { TicketEntity, TicketStatus } from '../../../../payments/domain/entities/ticket.entity';
import { RouteEntity } from '../../../../events/domain/entities/route.entity';

@Injectable()
export class TypeormGamificationRepository implements GamificationRepository {
  constructor(
    @InjectRepository(AchievementEntity)
    private readonly achievementRepo: Repository<AchievementEntity>,
    @InjectRepository(UserAchievementEntity)
    private readonly userAchievementRepo: Repository<UserAchievementEntity>,
    @InjectRepository(ScanEntity)
    private readonly scanRepo: Repository<ScanEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
    @InjectRepository(RouteEntity)
    private readonly routeRepo: Repository<RouteEntity>,
  ) {}

  async findAllAchievements(): Promise<AchievementEntity[]> {
    return this.achievementRepo.find({ order: { category: 'ASC', threshold: 'ASC' } });
  }

  async findUserAchievementsByProfileId(profileId: number): Promise<UserAchievementEntity[]> {
    return this.userAchievementRepo.find({
      where: { profileId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });
  }

  async findUserAchievement(profileId: number, achievementId: number): Promise<UserAchievementEntity | null> {
    return this.userAchievementRepo.findOne({
      where: { profileId, achievementId },
    });
  }

  async saveUserAchievement(data: Partial<UserAchievementEntity>): Promise<UserAchievementEntity> {
    const entity = this.userAchievementRepo.create(data);
    return this.userAchievementRepo.save(entity);
  }

  async countTotalScansByProfileId(profileId: number): Promise<number> {
    return this.scanRepo.count({ where: { profileId } });
  }

  async countCompletedRoutesByProfileId(profileId: number): Promise<number> {
    // Una ruta se considera completada cuando todos sus POIs han sido escaneados
    // por algún ticket del perfil
    const routes = await this.routeRepo
      .createQueryBuilder('route')
      .innerJoin('route.routePois', 'rp')
      .innerJoin('ticket', 'ticket', 'ticket.event_id = route.event_id AND ticket.profile_id = :profileId', { profileId })
      .where('route.deletedAt IS NULL')
      .select('route.id', 'routeId')
      .addSelect('COUNT(DISTINCT rp.poi_id)', 'totalPois')
      .addSelect(
        `COUNT(DISTINCT CASE WHEN EXISTS (
          SELECT 1 FROM scan s
          WHERE s.poi_id = rp.poi_id
          AND s.profile_id = :profileId
        ) THEN rp.poi_id END)`,
        'scannedPois',
      )
      .groupBy('route.id')
      .having('totalPois > 0 AND totalPois = scannedPois')
      .setParameter('profileId', profileId)
      .getRawMany();

    return routes.length;
  }

  async countPaidTicketsByProfileId(profileId: number): Promise<number> {
    return this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.event', 'event')
      .where('ticket.profileId = :profileId', { profileId })
      .andWhere('ticket.status IN (:...statuses)', {
        statuses: [TicketStatus.ACTIVE, TicketStatus.USED, TicketStatus.EXPIRED],
      })
      .andWhere('event.isPremium = true')
      .getCount();
  }

  async countUsedPaidTicketsByProfileId(profileId: number): Promise<number> {
    return this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.event', 'event')
      .where('ticket.profileId = :profileId', { profileId })
      .andWhere('ticket.status IN (:...statuses)', {
        statuses: [TicketStatus.USED, TicketStatus.EXPIRED],
      })
      .andWhere('event.isPremium = true')
      .getCount();
  }
}
