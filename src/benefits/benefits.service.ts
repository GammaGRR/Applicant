import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefit } from './entities/benefit.entity';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
  ) {}

  async findAll(): Promise<Benefit[]> {
    return this.benefitRepository.find();
  }

  async create(data: Partial<Benefit>): Promise<Benefit> {
    const exists = await this.benefitRepository.findOne({
      where: { name: data.name },
    });
    if (exists) throw new ConflictException('Такая льгота уже существует');
    const benefit = this.benefitRepository.create(data);
    return this.benefitRepository.save(benefit);
  }

  async remove(id: number): Promise<void> {
    await this.benefitRepository.delete(id);
  }
}