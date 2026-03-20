import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username })
            .getOne();
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async create(data: { username: string; password: string; fullname: string; role: UserRole }): Promise<User> {
        const exists = await this.userRepository.findOne({
            where: { username: data.username },
        });
        if (exists) throw new ConflictException('Пользователь с таким именем уже существует');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.userRepository.create({
            ...data,
            password: hashedPassword,
        });
        return this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    async updateRole(id: number, role: UserRole): Promise<User | null > {
        await this.userRepository.update(id, { role });
        return this.findById(id);
    }
}