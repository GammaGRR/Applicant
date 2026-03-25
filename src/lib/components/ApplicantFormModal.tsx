import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TextInput } from './elements/TextInput';
import { TextArea } from './elements/TextArea';
import { PhoneInput } from './elements/PhoneInput';
import { RadioGroup } from './elements/RadioGroup';
import { Checkbox } from './elements/CheckBox';
import { Select } from './elements/Select';
import { Field } from './Field';
import { Plus, X, FileText } from 'lucide-react';
import { PersonSection } from './elements/PersonSection';
import { DEFAULT_PERSON_FIELDS } from './elements/PersonSection';

export type FieldType =
  | 'text' | 'textarea' | 'phone' | 'radio' | 'checkbox' | 'select'
  | 'gpa'
  | 'heading' | 'person' | 'group' | 'specialty' | 'benefit' | 'documents';

export interface FormField {
  id: number;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order: number;
  cols: number;
  isGroup: boolean;
  groupId: string | null;
  direction?: 'row' | 'col';
  isApplicant?: boolean;
}

export interface ActiveForm {
  id: number;
  name: string;
  fields: FormField[];
}

const getColClass = (cols: number) => {
  if (cols === 1) return 'col-span-1';
  if (cols === 2) return 'col-span-2';
  return 'col-span-3';
};

// Утилита: извлечь быстрые поля из formData + fields формы
export const extractQuickFields = (fields: FormField[], values: Record<string, any>) => {
  let fullName = '', classes = '', profession = '', finance = '', benefit = '', note = '';
  let point: number | undefined;
  let checkedDocuments: string[] = [];
  let documentCounts: Record<string, number> = {};

  fields.forEach((f) => {
    const val = values[f.id];
    const label = (f.label ?? '').toLowerCase();

    if (f.type === 'person' && f.isApplicant && typeof val === 'object' && val !== null) {
      const parts = [val.lastName, val.firstName, val.middleName].filter(Boolean);
      if (parts.length > 0) fullName = parts.join(' ');
    }
    if (f.type === 'specialty') profession = Array.isArray(val) ? val.join(', ') : (val ?? '');
    if (f.type === 'benefit') benefit = Array.isArray(val) ? val.join(', ') : (val ?? '');
    if (f.type === 'documents') {
      if (Array.isArray(val)) {
        checkedDocuments = val;
        documentCounts = {};
      } else if (val && typeof val === 'object') {
        checkedDocuments = Array.isArray((val as any).selected) ? (val as any).selected : [];
        const rawCounts = (val as any).counts;
        if (rawCounts && typeof rawCounts === 'object') {
          const next: Record<string, number> = {};
          Object.entries(rawCounts).forEach(([k, v]) => {
            const n = Math.max(0, parseInt(String(v ?? ''), 10) || 0);
            if (n > 0) next[k] = n;
          });
          documentCounts = next;
        } else {
          documentCounts = {};
        }
      }
    }
    if (f.type === 'gpa') {
      // New format: { n2, n3, n4, n5 } counts of grades
      // Backward compatible: { grades: [] } or [] of grades
      const v: any = val ?? {};
      const n2 = Math.max(0, parseInt(String(v?.n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String(v?.n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String(v?.n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String(v?.n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      if (total > 0) {
        point = (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total;
      } else {
        const grades: any[] = Array.isArray(v) ? v : (Array.isArray(v?.grades) ? v.grades : []);
        const nums = grades
          .map((x) => Number(String(x).replace(',', '.')))
          .filter((n) => Number.isFinite(n));
        if (nums.length) point = nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    }

    if (label.includes('класс') || label.includes('образование')) classes = val ?? '';
    if (label.includes('финансиров') || label.includes('бюджет')) finance = val ?? '';
    if (label.includes('балл') || label.includes('gpa')) point = parseFloat(val) || undefined;
    if (label.includes('примечан') || label.includes('заметк')) note = val ?? '';
    if (f.type !== 'specialty' && label.includes('специальност')) profession = val ?? '';
    if (f.type !== 'benefit' && label.includes('льгот')) benefit = Array.isArray(val) ? val.join(', ') : (val ?? '');
  });

  return { fullName, classes, profession, finance, point, benefit, note, checkedDocuments, documentCounts };
};

const isCountableDocument = (name: string): boolean => {
  const n = String(name ?? '').toLowerCase();
  // docs from screenshot: copy of attestate/passport/vaccine card/snils + photo
  if (n.includes('фото')) return true;
  if (!n.includes('копи')) return false;
  return (
    n.includes('аттест') ||
    n.includes('паспорт') ||
    n.includes('привив') ||
    n.includes('снилс')
  );
};

const DocumentsWithCounts = ({
  options,
  value,
  onChange,
  readOnly,
}: {
  options: string[];
  value: any;
  onChange: (v: any) => void;
  readOnly: boolean;
}) => {
  const selected: string[] = Array.isArray(value)
    ? value
    : Array.isArray(value?.selected)
      ? value.selected
      : [];
  const counts: Record<string, any> =
    value && typeof value === 'object' && value.counts && typeof value.counts === 'object'
      ? value.counts
      : {};

  const toggle = (opt: string) => {
    if (readOnly) return;
    const nextSelected = selected.includes(opt)
      ? selected.filter((x) => x !== opt)
      : [...selected, opt];
    const nextCounts = { ...counts };
    if (!nextSelected.includes(opt)) delete nextCounts[opt];
    onChange({ selected: nextSelected, counts: nextCounts });
  };

  const setCount = (opt: string, v: string) => {
    if (readOnly) return;
    onChange({ selected, counts: { ...counts, [opt]: v } });
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        const countable = isCountableDocument(opt);
        return (
          <div key={opt} className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt)}
                className="accent-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>

            {checked && countable && (
              <div className="pl-6">
                <input
                  inputMode="numeric"
                  placeholder="Кол-во"
                  value={String(counts[opt] ?? '')}
                  onChange={(e) => setCount(opt, e.target.value)}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Form Content ─────────────────────────────────────────────────────

interface FormContentProps {
  form: ActiveForm;
  values: Record<string, any>;
  setValues: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
  readOnly?: boolean;
}

export const ApplicantFormContent = ({ form, values, setValues, readOnly = false }: FormContentProps) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/specialities').then(r => r.json()).then(data => setSpecialties(data.map((s: any) => `${s.code} ${s.name}`))).catch(() => {});
    fetch('http://localhost:3000/benefits').then(r => r.json()).then(data => setBenefits(data.map((b: any) => b.name))).catch(() => {});
    fetch('http://localhost:3000/documents').then(r => r.json()).then(data => setDocuments(data.map((d: any) => d.name))).catch(() => {});
  }, []);

  const renderFieldContent = (field: FormField) => {
    const value = values[field.id];
    const onChange = (v: any) => setValues(prev => ({ ...prev, [field.id]: v }));

    switch (field.type) {
      case 'person':
        return (
          <PersonSection
            title={field.label}
            data={values[field.id] ?? { lastName: '', firstName: '', middleName: '', address: '', phone: '', workplace: '', position: '' }}
            onChange={readOnly ? () => {} : (key, val) => setValues(prev => ({ ...prev, [field.id]: { ...prev[field.id], [key]: val } }))}
            activeFields={
              field.options?.length > 0
                ? field.options.filter((o): o is any => DEFAULT_PERSON_FIELDS.includes(o as any))
                : undefined
            }
          />
        );
      case 'radio':
        return <RadioGroup value={value ?? ''} onChange={readOnly ? () => {} : onChange} options={field.options.map(o => ({ label: o, value: o }))} direction={field.direction ?? 'row'} />;
      case 'text':
        return <TextInput value={value ?? ''} onChange={readOnly ? () => {} : onChange} placeholder={field.placeholder} />;
      case 'textarea':
        return <TextArea value={value ?? ''} onChange={readOnly ? () => {} : onChange} placeholder={field.placeholder} />;
      case 'phone':
        return <PhoneInput value={value ?? ''} onChange={readOnly ? () => {} : onChange} />;
      case 'checkbox':
        return field.options?.length > 0 ? (
          <Checkbox options={field.options} value={value ?? []} onChangeMultiple={readOnly ? () => {} : onChange} direction={field.direction ?? 'row'} />
        ) : <Checkbox label={field.label} checked={value ?? false} onChange={readOnly ? () => {} : onChange} />;
      case 'select':
        return <Select value={value ?? ''} onChange={readOnly ? () => {} : onChange} options={field.options} />;
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
                onChange={(e) => { if (readOnly) return; onChange({ ...(counts as any), n2: e.target.value }); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                inputMode="numeric"
                placeholder="Троек"
                value={String((counts as any).n3 ?? '')}
                onChange={(e) => { if (readOnly) return; onChange({ ...(counts as any), n3: e.target.value }); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                inputMode="numeric"
                placeholder="Четвёрок"
                value={String((counts as any).n4 ?? '')}
                onChange={(e) => { if (readOnly) return; onChange({ ...(counts as any), n4: e.target.value }); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                inputMode="numeric"
                placeholder="Пятёрок"
                value={String((counts as any).n5 ?? '')}
                onChange={(e) => { if (readOnly) return; onChange({ ...(counts as any), n5: e.target.value }); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
        return <Select value={value ?? ''} onChange={readOnly ? () => {} : onChange} options={specialties} />;
      case 'benefit':
        return <Checkbox options={benefits} value={value ?? []} onChangeMultiple={readOnly ? () => {} : onChange} direction={field.direction ?? 'col'} />;
      case 'documents':
        return (
          <DocumentsWithCounts
            options={documents}
            value={value ?? { selected: [], counts: {} }}
            onChange={onChange}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  const renderField = (field: FormField) => {
    if (field.type === 'heading') return <div key={field.id} className="pt-2 pb-1 border-b border-gray-200 col-span-3"><h3 className="text-base font-semibold text-gray-800">{field.label}</h3></div>;
    if (field.type === 'group') {
      const groupFields = form.fields.filter(f => f.groupId === String(field.id)).sort((a, b) => a.order - b.order);
      return <div key={field.id} className="col-span-3 border border-gray-200 rounded-xl p-4">
        {field.label && <p className="text-sm font-medium text-gray-600 mb-3">{field.label}</p>}
        <div className="grid grid-cols-3 gap-3">{groupFields.map(gf => <div key={gf.id} className={getColClass(gf.cols ?? 3)}><Field label={gf.type === 'checkbox' ? '' : gf.label} required={gf.required}>{renderFieldContent(gf)}</Field></div>)}</div>
      </div>;
    }
    if (field.type === 'person' || field.type === 'documents') return <div key={field.id} className="col-span-3"><Field label={field.label || (field.type === 'documents' ? 'Документы' : '')} required={field.required}>{renderFieldContent(field)}</Field></div>;
    return <div key={field.id} className={getColClass(field.cols ?? 3)}><Field label={field.type === 'checkbox' ? '' : field.label} required={field.required}>{renderFieldContent(field)}</Field></div>;
  };

  const topLevelFields = form.fields.filter(f => !f.groupId).sort((a, b) => a.order - b.order);
  return <div className={`grid grid-cols-3 gap-4 ${readOnly ? 'pointer-events-none opacity-80' : ''}`}>{topLevelFields.map(field => renderField(field))}</div>;
};

// ─── ApplicantForm Button ─────────────────────────────────────────────

export const ApplicantForm = ({ onCreated }: { onCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:3000/forms/active').then(r => r.json()).then(data => {
      setActiveForm(data);
      if (data?.fields) {
        const initial: Record<string, any> = {};
        data.fields.forEach((f: FormField) => {
          if (f.type === 'checkbox') initial[f.id] = f.options?.length > 0 ? [] : false;
          else if (f.type === 'person') initial[f.id] = { lastName: '', firstName: '', middleName: '', address: '', phone: '', workplace: '', position: '' };
          else if (f.type === 'gpa') initial[f.id] = { n2: '', n3: '', n4: '', n5: '' };
          else if (f.type === 'documents') initial[f.id] = { selected: [], counts: {} };
          else initial[f.id] = '';
        });
        setValues(initial);
      }
    }).catch(() => {});
  }, []);

  const handleClose = () => { setIsClosing(true); setTimeout(() => { setOpen(false); setIsClosing(false); setError(null); setCaseNumber(''); }, 150); };

  const handleSave = async () => {
    if (!activeForm) return;
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const quick = extractQuickFields(activeForm.fields, values);
      let documents: { name: string; status: 'done' | 'missing'; count?: number }[] = [];
      try {
        const docsRes = await fetch('http://localhost:3000/documents');
        const allDocs = await docsRes.json();
        const allDocNames: string[] = allDocs.map((d: any) => d.name);
        documents = allDocNames.map((name) => {
          const done = quick.checkedDocuments.includes(name);
          const count = done ? quick.documentCounts?.[name] : undefined;
          return {
            name,
            status: done ? 'done' : 'missing',
            ...(count && count > 0 ? { count } : {}),
          };
        });
      } catch { /* ignore */ }

      const response = await fetch('http://localhost:3000/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ caseNumber, formData: values, formId: activeForm.id, ...quick, documents }),
      });
      if (!response.ok) throw new Error();
      handleClose(); onCreated?.();
    } catch { setError('Не удалось сохранить анкету. Попробуйте ещё раз.'); }
    finally { setSaving(false); }
  };

  useEffect(() => { if (!open) return; const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); }; document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [open]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-black transition">
        <Plus size={16} /> Добавить абитуриента
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={handleClose}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div ref={modalRef} onClick={e => e.stopPropagation()} className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl ${isClosing ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-10">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><FileText size={20} className="text-blue-600" />{activeForm?.name ?? 'Анкета абитуриента'}</h2>
              <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
            </div>
            <div className="p-6">
              {!activeForm && <p className="text-gray-400 text-sm text-center py-8">Активная форма не выбрана. Создайте форму в админ панели.</p>}
              {activeForm && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">№ дела <span className="text-red-500">*</span></label>
                    <input type="text" value={caseNumber} onChange={e => setCaseNumber(e.target.value)} placeholder="Например: 1/9 ИС" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <ApplicantFormContent form={activeForm} values={values} setValues={setValues} />
                </>
              )}
              {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
              {activeForm && <button type="button" onClick={handleSave} disabled={saving} className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-md disabled:opacity-50 transition">{saving ? 'Сохранение...' : 'Сохранить анкету'}</button>}
            </div>
          </div>
        </div>, document.body)}
    </>
  );
};