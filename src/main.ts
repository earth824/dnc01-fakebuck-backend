import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { GlobalValidationPipe } from 'src/common/pipes/global-validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new GlobalValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Fakebuck API')
    .setDescription('This is a simple Fakebuck api')
    .setVersion('2.2')
    .addServer('http://localhost:8000')
    .addBearerAuth({ type: 'http', scheme: 'bearer' })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Nest application failed during bootstrap',
    error instanceof Error ? error.message : 'Unexpected occurred error'
  );
});
