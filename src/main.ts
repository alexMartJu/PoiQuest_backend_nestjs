import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorResponse } from './shared/dto/error.response.dto';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Pipes de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no declarados en DTO
      transform: true, // transforma tipos automáticamente
      forbidNonWhitelisted: true,
    }),
  );

  const isDev = process.env.NODE_ENV !== 'production';

  // Swagger solo en desarrollo
  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('PoIQuest')
      .setDescription('Documentación de NestJs de la aplicación PoIQuest')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [ErrorResponse],
    });
    SwaggerModule.setup('docs', app, document);

    console.log('Swagger habilitado en /docs');
  } else {
    console.log('Swagger deshabilitado en producción');
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
