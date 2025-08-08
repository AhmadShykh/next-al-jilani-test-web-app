import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';



async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector)); 

    const config = new DocumentBuilder()
        .setTitle('Auth API')
        .setDescription('Signup and Email Verification')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
