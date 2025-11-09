import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { BlacklistTokenEntity } from '../../../domain/entities/blacklist-token.entity';

@Injectable()
export class TypeormAuthRepository implements AuthRepository {
  constructor(
    @InjectRepository(BlacklistTokenEntity)
    private readonly blacklistTokenRepo: Repository<BlacklistTokenEntity>,
  ) {}

  async saveBlacklistToken(blacklistToken: BlacklistTokenEntity): Promise<BlacklistTokenEntity> {
    return this.blacklistTokenRepo.save(blacklistToken);
  }

  async deleteExpiredBlacklistTokens(): Promise<void> {
    await this.blacklistTokenRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const count = await this.blacklistTokenRepo.count({ where: { token } });
    return count > 0;
  }
}
