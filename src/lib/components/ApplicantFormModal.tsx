import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { FormState, PersonInfo } from '../types/formTypes';
import { PROFESSIONS, MAIN_DOCS, COPY_DOCS } from '../constants/formData';
import { TextInput } from './elements/TextInput';
import { SectionHeader } from './SectionHeader';
import { Checkbox } from './elements/CheckBox';
import { Select } from './elements/Select';
import { PersonSection } from './PersonSection';
import { TextArea } from './elements/TextArea';
import { RadioGroup } from './elements/RadioGroup';
import { Field } from './Field';
import { Plus, X, FileText } from 'lucide-react';

const emptyPerson = (): PersonInfo => ({
  lastName: '',
  firstName: '',
  middleName: '',
  address: '',
  phone: '',
  workplace: '',
  position: '',
});

export const ApplicantForm = () => {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const initialForm: FormState = {
    caseNumber: '',
    lastName: '',
    firstName: '',
    middleName: '',
    address: '',
    classCount: '',
    profession: '',

    cert9: false,
    cert11: false,
    diplomaProfessional: false,
    needsDorm: false,

    mother: emptyPerson(),
    father: emptyPerson(),

    note: '',

    docs: Object.fromEntries(MAIN_DOCS.map((d) => [d, false])) as Record<
      string,
      boolean
    >,
    copyDocs: Object.fromEntries(COPY_DOCS.map((d) => [d, false])) as Record<
      string,
      boolean
    >,
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const updatePerson = (
    parent: 'mother' | 'father',
    field: keyof PersonInfo,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const resetForm = () => setForm(initialForm);

  const handleSave = () => {
    alert('Анкета сохранена!');
    console.log(form);
    resetForm();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-black transition"
      >
        <Plus size={16} />
        Добавить абитуриента
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-10">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText size={20} className="text-blue-600" />
                  Анкета абитуриента
                </h2>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <SectionHeader title="Основная информация" />
                  <Field label="№ дела" required>
                    <TextInput
                      value={form.caseNumber}
                      onChange={(v) => setField('caseNumber', v)}
                    />
                  </Field>
                  <SectionHeader title="Документы" />
                  <div className="space-y-2">
                    {MAIN_DOCS.map((doc) => (
                      <Checkbox
                        key={doc}
                        label={doc}
                        checked={form.docs[doc]}
                        onChange={(v) =>
                          setField('docs', { ...form.docs, [doc]: v })
                        }
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    {COPY_DOCS.map((doc) => (
                      <Checkbox
                        key={doc}
                        label={doc}
                        checked={form.copyDocs[doc]}
                        onChange={(v) =>
                          setField('copyDocs', { ...form.copyDocs, [doc]: v })
                        }
                      />
                    ))}
                  </div>
                  <Field label="Примечание">
                    <TextArea
                      value={form.note}
                      onChange={(v) => setField('note', v)}
                    />
                  </Field>
                  <Field label="Количество классов" required>
                    <RadioGroup
                      options={[
                        { label: '9 классов', value: '9' },
                        { label: '11 классов', value: '11' },
                      ]}
                      value={form.classCount}
                      onChange={(v) => setField('classCount', v)}
                    />
                  </Field>
                  <Field label="Профессия">
                    <Select
                      options={PROFESSIONS}
                      value={form.profession}
                      onChange={(v) => setField('profession', v)}
                    />
                  </Field>
                </section>
                <section>
                  <SectionHeader title="Образование" />
                  <Checkbox
                    label="Общежитие"
                    checked={form.needsDorm}
                    onChange={(v) => setField('needsDorm', v)}
                  />
                </section>
                <PersonSection
                  title="Информация о матери"
                  data={form.mother}
                  onChange={(f, v) => updatePerson('mother', f, v)}
                />
                <PersonSection
                  title="Информация об отце"
                  data={form.father}
                  onChange={(f, v) => updatePerson('father', f, v)}
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-md"
                >
                  Сохранить анкету
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
