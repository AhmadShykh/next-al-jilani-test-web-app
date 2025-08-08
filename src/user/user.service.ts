import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {UserStatus } from '@prisma/client/wasm'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }

  async activateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.ACTIVE,
        verificationToken: null,
        tokenExpiry: null,
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    verificationToken: string;
    tokenExpiry: Date;
  }) {
    return this.prisma.user.create({ data });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
