import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para la estrategia 'local' de Passport.
 *
 * Se usa normalmente en el endpoint de login. `AuthGuard('local')`
 * delega en la estrategia local (habitualmente valida email+password)
 * y, si las credenciales son correctas, deja `req.user` disponible
 * para el handler del controlador.
 *
 * Uso:
 *   @Public()
 *   @UseGuards(LocalAuthGuard)
 *   @Post('login')
 *   login(@Req() req) { ... }
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
