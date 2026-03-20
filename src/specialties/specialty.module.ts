import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speciality } from './entities/specialty.entity';
import { SpecialitiesService } from './specialty.service';
import { SpecialitiesController } from './specialty.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Speciality])],
  providers: [SpecialitiesService],
  controllers: [SpecialitiesController],
})
export class SpecialitiesModule {}