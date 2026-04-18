import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cfg: AppConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth. Add ?source=extension for extension flow.' })
  googleAuth() { /* handled by Passport */ }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: any, @Res() res: any) {
    const token = this.authService.login(req.user);
    const source = req.query.state || 'web';
    const { frontendUrl } = this.cfg.get('urls');

    if (source === 'extension') {
      return res.redirect(`${frontendUrl}/extension-auth?token=${token}`);
    }
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  me(@Req() req: any) {
    const { id, email, name, avatar } = req.user;
    return { id, email, name, avatar };
  }
}
