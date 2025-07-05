import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HelpModule } from './help/help.module';
import { ActivitiesModule } from './activities/activities.module';
import { CategoryModule } from './category/category.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
    UserModule,
    HelpModule,
    ActivitiesModule,
    CategoryModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
