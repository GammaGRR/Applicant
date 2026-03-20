import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Speciality } from './entities/specialty.entity';

@Injectable()
export class SpecialitiesService {
  constructor(
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
  ) {}

  async findAll(): Promise<Speciality[]> {
    return this.specialityRepository.find();
  }

  async create(data: Partial<Speciality>): Promise<Speciality> {
    const exists = await this.specialityRepository.findOne({
      where: { code: data.code },
    });
    if (exists) throw new ConflictException('Специальность с таким кодом уже существует');
    const speciality = this.specialityRepository.create(data);
    return this.specialityRepository.save(speciality);
  }

  async remove(id: number): Promise<void> {
    await this.specialityRepository.delete(id);
  }
}