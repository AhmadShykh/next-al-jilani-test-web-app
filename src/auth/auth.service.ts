import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, isBefore } from 'date-fns';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { UserService } from '../user/user.service';


@Injectable()
export class AuthService {
    constructor
        (
            private userService: UserService) {

    }

    async signup(dto: SignupDto) {
        const existingUser = await this.userService.findByEmail(dto.email);
        if (existingUser) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const verificationToken = uuidv4();
        const expiry = addMinutes(new Date(), 10);

        await this.userService.createUser({
            name: dto.name,
            email: dto.email,
            phoneNumber: dto.phoneNumber,
            password: hashedPassword,
            verificationToken,
            tokenExpiry: expiry,
        });

        await this.sendVerificationEmail(dto.email, verificationToken);

        return { message: 'Signup successful. Please verify your email.' };
    }

    async verifyEmail(token: string) {
        const user = await this.userService.findByVerificationToken(token);
        if (!user) {
            throw new BadRequestException('Invalid verification token');
        }

        if (!user.tokenExpiry || isBefore(user.tokenExpiry, new Date())) {
            throw new BadRequestException('Verification token expired');
        }

        await this.userService.activateUser(user.id);

        return { message: 'Email verified. Your account is now active.' };
    }

    private async sendVerificationEmail(email: string, token: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const url = `http://${process.env.HOSTNAME}:${process.env.PORT}/verify-email?token=${token}`;
        const mailOptions = {
            from: `"No Reply" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your email',
            html: `Click <a href="${url}">here</a> to verify your email. This link expires in 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);
    }
}
