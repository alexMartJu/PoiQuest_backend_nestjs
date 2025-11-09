import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { promisify } from 'util';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { ProfileEntity } from '../../../entities/profile.entity';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly dataSource: DataSource,
  ) {}

  // Devuelve la lista completa de usuarios registrados
  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepo.findAll();
  }

  // Crea un usuario y su perfil en una única transacción para asegurar
  // que ambos objetos se persistan de forma consistente o se deshagan juntos.
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    // Validaciones
    await this.ensureEmailIsUnique(dto.email);

    // Hash de la contraseña (bcryptjs usando Promise para await)
    const hash = promisify(bcrypt.hash) as (data: string, saltOrRounds: number) => Promise<string>;
    const passwordHash = await hash(dto.password, 12);

    // Busca el rol (lanza ValidationError si no existe)
    const role = await this.findRoleByNameOrFail(dto.roleName);

    // Ejecuta la creación de user + profile en una transacción para asegurar atomicidad
    const userWithProfile = await this.dataSource.transaction(async (manager) => {
      // Crea usuario
      const user = new UserEntity();
      user.email = dto.email;
      user.password = passwordHash;
      user.status = UserStatus.ACTIVE;
      user.tokenVersion = 1;
      user.roles = [role];

      const savedUser = await manager.getRepository(UserEntity).save(user);

      // Crea el perfil asociado: avatar por defecto si no se proporciona, bio queda null si no viene
      const profile = new ProfileEntity();
      profile.userId = savedUser.id;
      profile.name = dto.name;
      profile.lastname = dto.lastname;
      profile.avatarUrl = dto.avatarUrl ?? 'https://static.productionready.io/images/smiley-cyrus.jpg';
      profile.bio = dto.bio ?? null;

      await manager.getRepository(ProfileEntity).save(profile);

      // Recarga usuario con relaciones
      const reloaded = await manager.getRepository(UserEntity).findOne({
        where: { id: savedUser.id },
        relations: ['roles', 'profile'],
      });

      return reloaded!;
    });

    return userWithProfile;
  }

  // Persiste cambios realizados sobre una entidad User existente
  async saveUser(user: UserEntity): Promise<UserEntity> {
    return await this.usersRepo.save(user);
  }


  // ============ Funciones auxiliares ============

  // Recupera un usuario por su identificador; si no existe, lanza NotFoundError
  async findUserByIdOrFail(userId: number): Promise<UserEntity> {
    const user = await this.usersRepo.findOneById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return user;
  }

  // Recupera un usuario por su email; lanza NotFoundError si no se encuentra
  async findUserByEmailOrFail(email: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOneByEmail(email);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return user;
  }

  // Busca un usuario por email sin lanzar excepción; devuelve null si no existe
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOneByEmail(email);
  }

  // Comprueba que el email no esté ya registrado y falla con ConflictError en caso contrario
  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.usersRepo.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }
  }

  // Localiza un rol por su nombre; si no existe, lanza ValidationError para que el
  // controlador/filtro global pueda mapearlo a la respuesta adecuada.
  private async findRoleByNameOrFail(roleName: string): Promise<any> {
    const role = await this.usersRepo.findRoleByName(roleName);
    if (!role) {
      throw new ValidationError(`Rol: "${roleName}" no encontrado en la base de datos`);
    }
    return role;
  }

}
