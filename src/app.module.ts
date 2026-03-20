import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SpecialitiesModule } from './specialties/specialty.module';
import { BenefitsModule } from './benefits/benefit.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    // Загружаем .env глобально
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    UsersModule,
    AuthModule,
    AdminModule,
    SpecialitiesModule,
    BenefitsModule,
    DocumentsModule,

    // Подключение к PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Поставить false если таблицы уже есть
        logging: true,
      }),
    }),
  ],
})
export class AppModule { }