import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async login(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);

        if (!user) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        const payload = { sub: user.id, username: user.username, role: user.role };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                fullname: user.username,
            },
        };
    }
}