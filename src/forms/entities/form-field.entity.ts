import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Form } from './form.entity';

export type FieldType = 'text' | 'textarea' | 'phone' | 'radio' | 'checkbox' | 'select' | 'heading' | 'person';

@Entity('form_fields')
export class FormField {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Form, (form) => form.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formId' })
  form: Form;

  @Column()
  formId: number;

  @Column()
  type: FieldType;

  @Column()
  label: string;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ default: false })
  required: boolean;

  @Column('simple-array', { nullable: true })
  options: string[];

  @Column({ default: 0 })
  order: number;

  @Column({ default: 3 })
  cols: number;

  @Column({ nullable: true })
  groupId: string;

  @Column({ default: false })
  isGroup: boolean;

  @Column({ default: 'row' })
  direction: string;

  @Column({ default: false })
  isApplicant: boolean;
}