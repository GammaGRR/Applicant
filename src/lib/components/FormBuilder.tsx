import { useState, useRef, useEffect } from 'react';
import { X, Trash2, Plus, Eye, EyeOff, GripVertical } from 'lucide-react';
import { TextInput } from './elements/TextInput';
import { TextArea } from './elements/TextArea';
import { PhoneInput } from './elements/PhoneInput';
import { RadioGroup } from './elements/RadioGroup';
import { Checkbox } from './elements/CheckBox';
import { Select } from './elements/Select';
import {
  PersonSection,
  PERSON_FIELDS,
  DEFAULT_PERSON_FIELDS,
} from './elements/PersonSection';
import { Field } from './Field';
import type { PersonInfo } from '../types/formTypes';

type FieldType =
  | 'text'
  | 'textarea'
  | 'phone'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'gpa'
  | 'heading'
  | 'person'
  | 'group'
  | 'specialty'
  | 'benefit'
  | 'documents';

interface Field {
  uid: string;
  id?: number;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order: number;
  cols: number;
  isGroup: boolean;
  groupId: string | null;
  direction: 'row' | 'col';
  isApplicant: boolean;
}

const FIELD_TYPES: { type: FieldType; label: string; group?: string }[] = [
  { type: 'heading', label: 'Заголовок раздела' },
  { type: 'group', label: 'Группа полей' },
  { type: 'text', label: 'Текст' },
  { type: 'textarea', label: 'Многострочный текст' },
  { type: 'phone', label: 'Телефон' },
  { type: 'radio', label: 'Радио кнопки' },
  { type: 'checkbox', label: 'Чекбокс' },
  { type: 'select', label: 'Выпадающий список' },
  { type: 'gpa', label: 'Средний балл (калькулятор)' },
  { type: 'person', label: 'Информация о персоне' },
  { type: 'specialty', label: 'Специальность (из БД)', group: 'db' },
  { type: 'benefit', label: 'Льгота (из БД)', group: 'db' },
  { type: 'documents', label: 'Документы (из БД)', group: 'db' },
];

const COL_OPTIONS = [
  { value: 1, label: '1/3' },
  { value: 2, label: '1/2' },
  { value: 3, label: 'Полная' },
];

// Типы, которые не нужно показывать в панели добавления внутри группы
const NO_GROUP_TYPES: FieldType[] = [
  'heading',
  'group',
  'person',
  'specialty',
  'benefit',
  'documents',
];

const emptyField = (
  type: FieldType,
  order: number,
  groupId: string | null = null,
): Field => ({
  uid: crypto.randomUUID(),
  type,
  label: '',
  placeholder: '',
  required: false,
  options: type === 'person' ? [...DEFAULT_PERSON_FIELDS] : [],
  order,
  cols: 3,
  isGroup: type === 'group',
  groupId,
  direction: 'row',
  isApplicant: false,
});

const getColClass = (cols: number) => {
  if (cols === 1) return 'col-span-1';
  if (cols === 2) return 'col-span-2';
  return 'col-span-3';
};

// ─── Хук загрузки данных из БД ──────────────────────────────────────────────

const useDbOptions = () => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/specialities')
      .then((r) => r.json())
      .then((data) =>
        setSpecialties(data.map((s: any) => `${s.code} ${s.name}`)),
      )
      .catch(() => {});

    fetch('http://localhost:3000/benefits')
      .then((r) => r.json())
      .then((data) => setBenefits(data.map((b: any) => b.name)))
      .catch(() => {});

    fetch('http://localhost:3000/documents')
      .then((r) => r.json())
      .then((data) => setDocuments(data.map((d: any) => d.name)))
      .catch(() => {});
  }, []);

  return { specialties, benefits, documents };
};

const OptionsEditor = ({
  options,
  onChange,
}: {
  options: string[];
  onChange: (opts: string[]) => void;
}) => {
  const addOption = () => onChange([...options, '']);
  const updateOption = (i: number, val: string) =>
    onChange(options.map((o, idx) => (idx === i ? val : o)));
  const removeOption = (i: number) =>
    onChange(options.filter((_, idx) => idx !== i));

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Варианты</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Вариант ${i + 1}`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => removeOption(i)}
              className="text-red-400 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
        >
          <Plus size={13} />
          Добавить вариант
        </button>
      </div>
    </div>
  );
};

const renderFieldContent = (
  field: Field,
  value: any,
  onChange: (v: any) => void,
  setValues: (fn: any) => void,
  dbOptions: { specialties: string[]; benefits: string[]; documents: string[] },
) => {
  switch (field.type) {
    case 'text':
      return (
        <TextInput
          value={value ?? ''}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case 'textarea':
      return (
        <TextArea
          value={value ?? ''}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case 'phone':
      return <PhoneInput value={value ?? ''} onChange={onChange} />;
    case 'radio':
      return (
        <RadioGroup
          value={value ?? ''}
          onChange={onChange}
          options={field.options.map((o) => ({ label: o, value: o }))}
          direction={field.direction ?? 'row'}
        />
      );
    case 'checkbox':
      return field.options.length > 0 ? (
        <Checkbox
          options={field.options}
          value={value ?? []}
          onChangeMultiple={onChange}
          direction={field.direction ?? 'row'}
        />
      ) : (
        <Checkbox
          label={field.label || 'Чекбокс'}
          checked={value ?? false}
          onChange={onChange}
        />
      );
    case 'select':
      return (
        <Select
          value={value ?? ''}
          onChange={onChange}
          options={field.options}
        />
      );
    case 'gpa': {
      const counts =
        typeof value === 'object' && value
          ? value
          : { n2: '', n3: '', n4: '', n5: '' };

      const n2 = Math.max(0, parseInt(String((counts as any).n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String((counts as any).n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String((counts as any).n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String((counts as any).n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      const avg = total ? (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total : NaN;

      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              inputMode="numeric"
              placeholder="Двоек"
              value={String((counts as any).n2 ?? '')}
              onChange={(e) => onChange({ ...(counts as any), n2: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              inputMode="numeric"
              placeholder="Троек"
              value={String((counts as any).n3 ?? '')}
              onChange={(e) => onChange({ ...(counts as any), n3: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              inputMode="numeric"
              placeholder="Четвёрок"
              value={String((counts as any).n4 ?? '')}
              onChange={(e) => onChange({ ...(counts as any), n4: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              inputMode="numeric"
              placeholder="Пятёрок"
              value={String((counts as any).n5 ?? '')}
              onChange={(e) => onChange({ ...(counts as any), n5: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Средний балл</span>
            <span className="text-sm font-semibold text-gray-800">
              {Number.isFinite(avg) ? avg.toFixed(2) : '—'}
            </span>
          </div>
        </div>
      );
    }
    case 'specialty':
      return (
        <Select
          value={value ?? ''}
          onChange={onChange}
          options={dbOptions.specialties}
        />
      );
    case 'benefit':
      return (
        <Checkbox
          options={dbOptions.benefits}
          value={value ?? []}
          onChangeMultiple={onChange}
          direction={field.direction ?? 'col'}
        />
      );
    case 'documents':
      return (
        <Checkbox
          options={dbOptions.documents}
          value={value ?? []}
          onChangeMultiple={onChange}
          direction={field.direction ?? 'col'}
        />
      );
    case 'person':
      return (
        <PersonSection
          title={field.label}
          data={
            value ?? {
              lastName: '',
              firstName: '',
              middleName: '',
              address: '',
              phone: '',
              workplace: '',
              position: '',
            }
          }
          onChange={(key, val) =>
            setValues((p: any) => ({
              ...p,
              [field.uid]: { ...p[field.uid], [key]: val },
            }))
          }
          activeFields={
            field.options?.length > 0
              ? field.options.filter((o): o is keyof PersonInfo =>
                  DEFAULT_PERSON_FIELDS.includes(o as keyof PersonInfo),
                )
              : undefined
          }
        />
      );
    default:
      return null;
  }
};

const FormPreview = ({ fields }: { fields: Field[] }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const dbOptions = useDbOptions();

  const topLevel = [...fields]
    .filter((f) => !f.groupId)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-3 gap-4">
      {topLevel.map((field) => {
        if (field.type === 'heading') {
          return (
            <div
              key={field.uid}
              className="col-span-3 pt-2 pb-1 border-b border-gray-200"
            >
              <h3 className="text-base font-semibold text-gray-800">
                {field.label || 'Заголовок'}
              </h3>
            </div>
          );
        }

        if (field.type === 'group') {
          const groupFields = [...fields]
            .filter((f) => f.groupId === field.uid)
            .sort((a, b) => a.order - b.order);
          return (
            <div
              key={field.uid}
              className="col-span-3 border border-gray-200 rounded-xl p-4"
            >
              {field.label && (
                <p className="text-sm font-medium text-gray-600 mb-3">
                  {field.label}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {groupFields.map((gf) => {
                  const value = values[gf.uid];
                  const onChange = (v: any) =>
                    setValues((p: any) => ({ ...p, [gf.uid]: v }));
                  return (
                    <div key={gf.uid} className={getColClass(gf.cols ?? 3)}>
                      <Field
                        label={gf.type === 'checkbox' ? '' : gf.label || 'Поле'}
                        required={gf.required}
                      >
                        {renderFieldContent(
                          gf,
                          value,
                          onChange,
                          setValues,
                          dbOptions,
                        )}
                      </Field>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (field.type === 'person') {
          return (
            <div key={field.uid} className="col-span-3">
              <PersonSection
                title={field.label}
                data={
                  values[field.uid] ?? {
                    lastName: '',
                    firstName: '',
                    middleName: '',
                    address: '',
                    phone: '',
                    workplace: '',
                    position: '',
                  }
                }
                onChange={(key, val) =>
                  setValues((p: any) => ({
                    ...p,
                    [field.uid]: { ...p[field.uid], [key]: val },
                  }))
                }
              />
            </div>
          );
        }

        if (field.type === 'documents') {
          const value = values[field.uid];
          const onChange = (v: any) =>
            setValues((p: any) => ({ ...p, [field.uid]: v }));
          return (
            <div key={field.uid} className="col-span-3">
              <Field
                label={field.label || 'Документы'}
                required={field.required}
              >
                {renderFieldContent(
                  field,
                  value,
                  onChange,
                  setValues,
                  dbOptions,
                )}
              </Field>
            </div>
          );
        }

        const value = values[field.uid];
        const onChange = (v: any) =>
          setValues((p: any) => ({ ...p, [field.uid]: v }));

        return (
          <div key={field.uid} className={getColClass(field.cols ?? 3)}>
            <Field
              label={field.type === 'checkbox' ? '' : field.label || 'Поле'}
              required={field.required}
            >
              {renderFieldContent(field, value, onChange, setValues, dbOptions)}
            </Field>
          </div>
        );
      })}
    </div>
  );
};

const FieldCard = ({
  field,
  updateField,
  removeField,
  addFieldToGroup,
  fields,
}: {
  field: Field;
  updateField: (uid: string, data: Partial<Field>) => void;
  removeField: (uid: string) => void;
  addFieldToGroup: (groupUid: string, type: FieldType) => void;
  fields: Field[];
}) => {
  const groupFields = field.isGroup
    ? fields
        .filter((f) => f.groupId === field.uid)
        .sort((a, b) => a.order - b.order)
    : [];

  const isDbType = ['specialty', 'benefit', 'documents'].includes(field.type);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5
        ${field.type === 'heading' ? 'border-l-4 border-blue-500' : ''}
        ${field.type === 'group' ? 'border border-dashed border-blue-300' : ''}
        ${isDbType ? 'border border-dashed border-green-300' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-300" />
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md
              ${field.type === 'group' ? 'bg-purple-50 text-purple-600' : ''}
              ${isDbType ? 'bg-green-50 text-green-700' : ''}
              ${!field.type || (!['group'].includes(field.type) && !isDbType) ? 'bg-blue-50 text-blue-600' : ''}
            `}
          >
            {FIELD_TYPES.find((ft) => ft.type === field.type)?.label}
          </span>
          {isDbType && (
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              из БД
            </span>
          )}
        </div>
        <button
          onClick={() => removeField(field.uid)}
          className="p-1 text-red-400 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          placeholder={
            field.type === 'heading'
              ? 'Текст заголовка'
              : field.type === 'group'
                ? 'Название группы (необязательно)'
                : 'Название поля'
          }
          value={field.label}
          onChange={(e) => updateField(field.uid, { label: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {['text', 'textarea', 'phone'].includes(field.type) && (
          <input
            placeholder="Плейсхолдер"
            value={field.placeholder}
            onChange={(e) =>
              updateField(field.uid, { placeholder: e.target.value })
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {['radio', 'select', 'checkbox'].includes(field.type) && (
          <OptionsEditor
            options={field.options}
            onChange={(opts) => updateField(field.uid, { options: opts })}
          />
        )}
        {field.type === 'gpa' && (
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            В анкете появятся поля для количества 2/3/4/5, средний балл будет считаться автоматически.
          </p>
        )}
        {isDbType && (
          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
            {field.type === 'specialty' &&
              'Варианты подтягиваются из таблицы специальностей'}
            {field.type === 'benefit' &&
              'Варианты подтягиваются из таблицы льгот'}
            {field.type === 'documents' &&
              'Чекбоксы подтягиваются из таблицы документов'}
          </p>
        )}
        {['radio', 'checkbox', 'documents'].includes(field.type) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Направление:</span>
            <button
              onClick={() => updateField(field.uid, { direction: 'row' })}
              className={`px-2 py-1 text-xs rounded-md transition ${(field.direction ?? 'row') === 'row' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              В строку
            </button>
            <button
              onClick={() => updateField(field.uid, { direction: 'col' })}
              className={`px-2 py-1 text-xs rounded-md transition ${field.direction === 'col' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              В колонку
            </button>
          </div>
        )}
        {field.type === 'group' && (
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Поля внутри группы:</p>
            <div className="flex flex-col gap-2 mb-3">
              {groupFields.map((gf) => (
                <div
                  key={gf.uid}
                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {FIELD_TYPES.find((ft) => ft.type === gf.type)?.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {gf.label || 'Без названия'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {COL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateField(gf.uid, { cols: opt.value })}
                        className={`px-1.5 py-0.5 text-xs rounded transition ${gf.cols === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      onClick={() => removeField(gf.uid)}
                      className="ml-1 text-red-400 hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {FIELD_TYPES.filter(
                (ft) => !NO_GROUP_TYPES.includes(ft.type),
              ).map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => addFieldToGroup(field.uid, ft.type)}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  + {ft.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {field.type === 'person' && (
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Поля блока персоны:</p>
            <div className="flex flex-col gap-1.5">
              {PERSON_FIELDS.map((pf) => {
                const active = (
                  field.options ?? DEFAULT_PERSON_FIELDS
                ).includes(pf.key);
                return (
                  <label
                    key={pf.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => {
                        const current =
                          field.options?.length > 0
                            ? field.options
                            : [...DEFAULT_PERSON_FIELDS];
                        const updated = e.target.checked
                          ? [...current, pf.key]
                          : current.filter((k) => k !== pf.key);
                        updateField(field.uid, { options: updated });
                      }}
                      className="accent-blue-500"
                    />
                    <span className="text-xs text-gray-700">{pf.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        {field.type === 'person' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={field.isApplicant ?? false}
              onChange={(e) => {
                if (e.target.checked) {
                  updateField(field.uid, { isApplicant: true });
                  fields.forEach((f) => {
                    if (f.type === 'person' && f.uid !== field.uid) {
                      updateField(f.uid, { isApplicant: false });
                    }
                  });
                } else {
                  updateField(field.uid, { isApplicant: false });
                }
              }}
              className="accent-blue-500"
            />
            <span className="text-gray-700">
              Это абитуриент{' '}
              <span className="text-xs text-gray-400">
                (ФИО попадёт в таблицу)
              </span>
            </span>
          </label>
        )}
        {!['heading', 'group', 'person', 'documents'].includes(field.type) && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  updateField(field.uid, { required: e.target.checked })
                }
                className="accent-blue-500"
              />
              Обязательное поле
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Ширина:</span>
              {COL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField(field.uid, { cols: opt.value })}
                  className={`px-2 py-1 text-xs rounded-md transition ${field.cols === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FormBuilder = ({
  form,
  onBack,
}: {
  form: any;
  onBack: () => void;
}) => {
  const [name, setName] = useState(form.name);
  const [fields, setFields] = useState<Field[]>(
    (form.fields ?? []).map((f: any) => ({
      ...f,
      uid: f.uid ?? crypto.randomUUID(),
      cols: f.cols ?? 3,
      isGroup: f.isGroup ?? false,
      groupId: f.groupId ?? null,
      direction: f.direction ?? 'row',
      isApplicant: f.isApplicant ?? false,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const topLevelFields = fields
    .filter((f) => !f.groupId)
    .sort((a, b) => a.order - b.order);
  const addField = (type: FieldType) => {
    setFields((prev) => [
      ...prev,
      emptyField(type, prev.filter((f) => !f.groupId).length),
    ]);
  };
  const addFieldToGroup = (groupUid: string, type: FieldType) => {
    const groupFields = fields.filter((f) => f.groupId === groupUid);
    setFields((prev) => [
      ...prev,
      emptyField(type, groupFields.length, groupUid),
    ]);
  };
  const updateField = (uid: string, data: Partial<Field>) => {
    setFields((prev) =>
      prev.map((f) => (f.uid === uid ? { ...f, ...data } : f)),
    );
  };
  const removeField = (uid: string) => {
    setFields((prev) => prev.filter((f) => f.uid !== uid && f.groupId !== uid));
  };
  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };
  const handleDrop = () => {
    if (dragIndex.current === null || dragOverIndex.current === null) return;
    const newTopLevel = [...topLevelFields];
    const dragged = newTopLevel.splice(dragIndex.current, 1)[0];
    newTopLevel.splice(dragOverIndex.current, 0, dragged);
    const reordered = newTopLevel.map((f, i) => ({ ...f, order: i }));
    setFields((prev) => [...reordered, ...prev.filter((f) => f.groupId)]);
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`http://localhost:3000/forms/${form.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name, fields }),
    });
    setSaving(false);
    onBack();
  };

  const regularTypes = FIELD_TYPES.filter((ft) => ft.group !== 'db');
  const dbTypes = FIELD_TYPES.filter((ft) => ft.group === 'db');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xl font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
          />
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${preview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {preview ? <EyeOff size={16} /> : <Eye size={16} />}
          {preview ? 'Редактор' : 'Предпросмотр'}
        </button>
      </div>
      {preview ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">{name}</h2>
          <FormPreview fields={fields} />
          <button className="mt-6 w-full py-3 bg-gray-800 text-white rounded-md text-sm">
            Сохранить анкету
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
            <p className="text-sm font-medium text-gray-500 mb-3">
              Добавить элемент
            </p>
            <div className="flex flex-col gap-1">
              {regularTypes.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => addField(ft.type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                    ${ft.type === 'group' ? 'text-purple-700 hover:bg-purple-50' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                  `}
                >
                  + {ft.label}
                </button>
              ))}
              <div className="border-t border-gray-100 my-2" />
              <p className="text-xs text-gray-400 px-3 mb-1">Из базы данных</p>
              {dbTypes.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => addField(ft.type)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition text-green-700 hover:bg-green-50"
                >
                  + {ft.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            {topLevelFields.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
                Добавьте элементы из панели слева
              </div>
            )}
            {topLevelFields.map((field, index) => (
              <div
                key={field.uid}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                className="cursor-grab active:cursor-grabbing"
              >
                <FieldCard
                  field={field}
                  updateField={updateField}
                  removeField={removeField}
                  addFieldToGroup={addFieldToGroup}
                  fields={fields}
                />
              </div>
            ))}
            {fields.filter((f) => !f.groupId).length > 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить форму'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
