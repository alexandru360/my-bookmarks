import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.model';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
