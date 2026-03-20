import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find();
  }

  async create(data: Partial<Document>): Promise<Document> {
    const exists = await this.documentRepository.findOne({
      where: { name: data.name },
    });
    if (exists) throw new ConflictException('Такой документ уже существует');
    const document = this.documentRepository.create(data);
    return this.documentRepository.save(document);
  }

  async remove(id: number): Promise<void> {
    await this.documentRepository.delete(id);
  }
}