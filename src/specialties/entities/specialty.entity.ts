import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";


@Entity('specialities')
export class Speciality {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ default: 0 })
    budgetPlaces: number;

    @Column({ default: 0 })
    paidPlaces: number;

    @CreateDateColumn()
    createdAt: Date;
}
