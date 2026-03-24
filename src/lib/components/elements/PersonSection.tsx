import { TextInput } from './TextInput';
import { PhoneInput } from './PhoneInput';
import { Field } from '../Field';
import { SectionHeader } from '../SectionHeader';
import type { PersonInfo } from '../../types/formTypes';

export const PERSON_FIELDS: { key: keyof PersonInfo; label: string }[] = [
  { key: 'lastName',   label: 'Фамилия' },
  { key: 'firstName',  label: 'Имя' },
  { key: 'middleName', label: 'Отчество' },
  { key: 'address',    label: 'Место жительства (адрес)' },
  { key: 'phone',      label: 'Контактный телефон' },
  { key: 'workplace',  label: 'Место работы' },
  { key: 'position',   label: 'Должность' },
];

export const DEFAULT_PERSON_FIELDS: (keyof PersonInfo)[] = PERSON_FIELDS.map((f) => f.key);

interface Props {
  title: string;
  data: PersonInfo;
  onChange: (f: keyof PersonInfo, v: string) => void;
  activeFields?: (keyof PersonInfo)[];
}

export const PersonSection = ({ title, data, onChange, activeFields }: Props) => {
  const visible = activeFields ?? DEFAULT_PERSON_FIELDS;
  const show = (key: keyof PersonInfo) => visible.includes(key);

  return (
    <section className="mb-6">
      <SectionHeader title={title} />
      <div className="space-y-4">
        {(show('lastName') || show('firstName') || show('middleName')) && (
          <div className="grid grid-cols-3 gap-3">
            {show('lastName') && (
              <Field label="Фамилия">
                <TextInput value={data.lastName} placeholder="Фамилия" onChange={(v) => onChange('lastName', v)} />
              </Field>
            )}
            {show('firstName') && (
              <Field label="Имя">
                <TextInput value={data.firstName} placeholder="Имя" onChange={(v) => onChange('firstName', v)} />
              </Field>
            )}
            {show('middleName') && (
              <Field label="Отчество">
                <TextInput value={data.middleName} placeholder="Отчество" onChange={(v) => onChange('middleName', v)} />
              </Field>
            )}
          </div>
        )}
        {(show('address') || show('phone')) && (
          <div className="grid grid-cols-2 gap-3">
            {show('address') && (
              <Field label="Место жительства (адрес)">
                <TextInput value={data.address} placeholder="Адрес" onChange={(v) => onChange('address', v)} />
              </Field>
            )}
            {show('phone') && (
              <Field label="Контактный телефон">
                <PhoneInput value={data.phone} onChange={(v) => onChange('phone', v)} />
              </Field>
            )}
          </div>
        )}
        {(show('workplace') || show('position')) && (
          <div className="grid grid-cols-2 gap-3">
            {show('workplace') && (
              <Field label="Место работы">
                <TextInput value={data.workplace} placeholder="Работа" onChange={(v) => onChange('workplace', v)} />
              </Field>
            )}
            {show('position') && (
              <Field label="Должность">
                <TextInput value={data.position} placeholder="Должность" onChange={(v) => onChange('position', v)} />
              </Field>
            )}
          </div>
        )}
      </div>
    </section>
  );
};