import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3080',
    'http://localhost',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (como mobile apps, curl, docker SSR) ou se estiver na lista permitida
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        callback(null, true);
        return;
      }

      // Em produção, negar origens desconhecidas. Em desenvolvimento, permitir com log de aviso.
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Origin not allowed by CORS'), false);
      } else {
        console.warn(`CORS: allowing origin ${origin} in non-production environment`);
        callback(null, true);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3080;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/v1`);
}
bootstrap();
