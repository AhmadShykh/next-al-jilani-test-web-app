import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SystemController } from './system/system.controller';
import { PrismaService } from 'prisma/prisma.service';
@Module({
  imports: [
    
    AuthModule,
    UserModule,
  ],
  controllers: [AppController,SystemController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
