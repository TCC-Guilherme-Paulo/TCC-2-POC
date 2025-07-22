import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log("App running at 3001");

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
    console.log("Hot reload activated!");
  }
}
bootstrap();