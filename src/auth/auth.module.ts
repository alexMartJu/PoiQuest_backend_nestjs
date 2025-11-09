import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BlacklistTokenEntity } from './domain/entities/blacklist-token.entity';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { AuthJwtService } from './application/services/auth-jwt.service';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { LocalStrategy } from './application/strategies/local.strategy';
import { AuthRepository } from './domain/repositories/auth.repository';
import { TypeormAuthRepository } from './infrastructure/persistence/typeorm/typeorm-auth.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('POIQUEST_JWT_ACCESS_KEY'),
        signOptions: {
          expiresIn: (configService.get<string>('POIQUEST_JWT_ACCESS_TTL')) as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([BlacklistTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
  AuthJwtService,
    JwtStrategy,
    LocalStrategy,
    { provide: AuthRepository, useClass: TypeormAuthRepository },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
