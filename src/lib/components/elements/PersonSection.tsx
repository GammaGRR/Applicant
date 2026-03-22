import { TextInput } from './TextInput';
import { PhoneInput } from './PhoneInput';
import { Field } from '../Field';
import { SectionHeader } from '../SectionHeader';
import type { PersonInfo } from '../../types/formTypes';

interface Props {
  title: string;
  data: PersonInfo;
  onChange: (f: keyof PersonInfo, v: string) => void;
}

export const PersonSection = ({ title, data, onChange }: Props) => {
  return (
    <section className="mb-6">
      <SectionHeader title={title} />

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Фамилия">
            <TextInput
              value={data.lastName}
              placeholder="Фамилия"
              onChange={(v) => onChange('lastName', v)}
            />
          </Field>

          <Field label="Имя">
            <TextInput
              value={data.firstName}
              placeholder="Имя"
              onChange={(v) => onChange('firstName', v)}
            />
          </Field>

          <Field label="Отчество">
            <TextInput
              value={data.middleName}
              placeholder="Отчество"
              onChange={(v) => onChange('middleName', v)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Место жительства (адрес)">
            <TextInput
              value={data.address}
              placeholder="Адрес"
              onChange={(v) => onChange('address', v)}
            />
          </Field>

          <Field label="Контактный телефон">
            <PhoneInput
              value={data.phone}
              onChange={(v) => onChange('phone', v)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Место работы">
            <TextInput
              value={data.workplace}
              placeholder="Работа"
              onChange={(v) => onChange('workplace', v)}
            />
          </Field>

          <Field label="Должность">
            <TextInput
              value={data.position}
              placeholder="Должность"
              onChange={(v) => onChange('position', v)}
            />
          </Field>
        </div>
      </div>
    </section>
  );
};
