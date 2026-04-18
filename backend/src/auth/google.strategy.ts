import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfigService } from '../config/app-config.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(cfg: AppConfigService, private usersService: UsersService) {
    const { googleClientId, googleClientSecret } = cfg.get('auth');
    const { backendUrl } = cfg.get('urls');
    super({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: `${backendUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
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
