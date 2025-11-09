import { BlacklistTokenEntity } from '../entities/blacklist-token.entity';

export abstract class AuthRepository {

  abstract isTokenBlacklisted(token: string): Promise<boolean>;
  abstract saveBlacklistToken(blacklistToken: BlacklistTokenEntity): Promise<BlacklistTokenEntity>;
  abstract deleteExpiredBlacklistTokens(): Promise<void>;
  
}
