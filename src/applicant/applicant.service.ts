import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from './entities/applicant.entity';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {}

  async findAll(): Promise<Applicant[]> {
    return this.applicantRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Applicant | null> {
    return this.applicantRepository.findOne({ where: { id } });
  }

  async create(data: {
    caseNumber?: string;
    formData: Record<string, any>;
    formId?: number;
    fullName?: string;
    classes?: string;
    profession?: string;
    finance?: string;
    point?: number;
    benefit?: string;
    note?: string;
    documents?: { name: string; status: 'done' | 'missing' }[];
    checkedDocuments?: string[];
  }): Promise<Applicant> {
    const { checkedDocuments: _, ...saveData } = data;
    const applicant = this.applicantRepository.create(saveData);
    return this.applicantRepository.save(applicant);
  }

  async update(id: number, data: Partial<Applicant> & { checkedDocuments?: string[] }): Promise<Applicant | null> {
    const { checkedDocuments: _, ...saveData } = data;
    await this.applicantRepository.update(id, saveData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.applicantRepository.delete(id);
  }

  async clearAll(): Promise<void> {
    await this.applicantRepository.clear();
  }
}