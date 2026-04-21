import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfigService } from '../config/app-config.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly configured: boolean;

  constructor(cfg: AppConfigService, private usersService: UsersService) {
    const { googleClientId, googleClientSecret } = cfg.get('auth');
    const { backendUrl } = cfg.get('urls');
    const configured = Boolean(googleClientId && googleClientSecret);
    super({
      clientID: googleClientId || 'GOOGLE_NOT_CONFIGURED',
      clientSecret: googleClientSecret || 'GOOGLE_NOT_CONFIGURED',
      callbackURL: `${backendUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
    this.configured = configured;
  }

  authenticate(req: any, options?: any) {
    if (!this.configured) {
      (req.res || req).status(503).json({ message: 'Google OAuth is not configured' });
      return;
    }
    super.authenticate(req, options);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.usersService.findOrCreate({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value || '',
    });
    done(null, user);
  }
}
