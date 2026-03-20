import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benefit } from './entities/benefit.entity';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit])],
  providers: [BenefitsService],
  controllers: [BenefitsController],
})
export class BenefitsModule {}