import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, isBefore } from 'date-fns';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { UserService } from '../user/user.service';
import { MailService } from '@/mail/mail.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { LoginDto } from './dto/login.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';


@Injectable()
export class AuthService {
    constructor
        (
            private userService: UserService,
            private jwtService: JwtService,) {

    }


    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== 'ACTIVE') {
            throw new BadRequestException('Please verify your email before logging in.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '10m',
        });

        return {
            message: 'Login successful',
            accessToken: token,
        };
    }

    async signup(dto: SignupDto) {
        const existingUser = await this.userService.findByEmail(dto.email);
        if (existingUser) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        await this.userService.createUser({
            name: dto.name,
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            password: hashedPassword,
        });

        const verificationToken = await this.jwtService.signAsync(
            { email: dto.email },
            {
                secret: process.env.JWT_VERIFICATION_SECRET,
                expiresIn: '10m',
            },
        );

        await this.sendVerificationEmail(dto.email, verificationToken);

        return { message: 'Signup successful. Please verify your email.' };
    }

    async forgotPassword(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create a JWT reset token valid for 10 mins
        const resetToken = this.jwtService.sign(
            { sub: user.id, email: user.email },
            { secret: process.env.JWT_VERIFICATION_SECRET, expiresIn: '10m' }
        );

        const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${resetToken}`;

        await MailService.sendMail(
            user.email,
            'Password Reset Request',
            `
      <p>Hello ${user.name || ''},</p>
      <p>Click the link below to reset your password. This link will expire in 10 minutes:</p>
      <a href="${resetLink}">Click here </a>
    `,
        );

        return { message: 'Password reset link sent to your email.' };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_VERIFICATION_SECRET,
            });

            const user = await this.userService.findByEmail(decoded.email);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.userService.updatePassword(user.id, hashedPassword);

            return { message: 'Password has been reset successfully.' };
        } catch (error) {
            throw new BadRequestException('Invalid or expired reset token');
        }
    }

    async getAllUsers(): Promise<GetAllUsersDto[]> {
        const users = await this.userService.getAllUsers();

        return users.map(user => {

            return {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                joinedAt: user.createdAt.toString(),
            };
        });
    }


    async verifyEmail(token: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_VERIFICATION_SECRET,
            });

            const user = await this.userService.findByEmail(decoded.email);
            if (!user) {
                throw new BadRequestException('User not found');
            }

            if (user.status === 'ACTIVE') {
                return { message: 'Email already verified' };
            }

            await this.userService.activateUser(user.id);

            return { message: 'Email verified. Your account is now active.' };
        } catch (error) {
            throw new BadRequestException('Invalid or expired verification token');
        }
    }

    private async sendVerificationEmail(email: string, token: string) {
        const url = `${process.env.APP_URL}/auth/verify?token=${token}`;
        await MailService.sendMail(
            email,
            'Verify your email',
            `Click <a href="${url}">here</a> to verify your email. This link expires in 10 minutes.`
        );
    }
}
