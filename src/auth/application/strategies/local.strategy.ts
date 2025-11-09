import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';

/**
 * LocalStrategy
 * -------------
 * Estrategia Passport 'local' para autenticación mediante email + contraseña.
 * - Configura los campos `usernameField` y `passwordField` que el
 *   cliente enviará en el body (aquí 'email' y 'password').
 * - En `validate` delega en `AuthService.validateCredentials` para comprobar
 *   las credenciales y devolver el usuario.
 * - Si `validate` devuelve un usuario, Passport lo adjunta a `request.user`
 *   y el controlador puede emitir tokens (login). Si no, lanzamos
 *   `UnauthorizedError`.
 *
 * Uso típico en el controlador: `@UseGuards(LocalAuthGuard)` antes del
 * endpoint de login para que Passport realice la validación.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateCredentials(email, password);
    if (!user) {
      // Lanzar UnauthorizedError para que el guard transforme a 401
      throw new UnauthorizedError('Credenciales inválidas');
    }
    // Devuelve el usuario; Passport lo pondrá en request.user
    return user;
  }
}
