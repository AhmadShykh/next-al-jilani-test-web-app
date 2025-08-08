import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client/wasm'
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }


  async activateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.ACTIVE,
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
