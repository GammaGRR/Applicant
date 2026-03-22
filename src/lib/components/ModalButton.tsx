import { useState, useRef, useEffect } from 'react';
import {
  EllipsisVertical,
  SquarePen,
  Trash,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { AdminRoute } from './AdminRoute';
import {
  ApplicantFormContent,
  extractQuickFields,
  type ActiveForm,
} from './ApplicantFormModal';

interface Applicant {
  id: number;
  caseNumber: string;
  fullName: string;
  classes: string;
  profession: string;
  finance: string;
  point: number;
  benefit: string;
  note: string;
  formData: Record<string, any>;
}

interface Props {
  applicant: Applicant;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

type ModalMode = 'view' | 'edit' | null;

export const ModalButton = ({ applicant, onDeleted, onUpdated }: Props) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
  const [values, setValues] = useState<Record<string, any>>(
    applicant.formData ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch('http://localhost:3000/forms/active')
      .then((r) => r.json())
      .then((data) => setActiveForm(data))
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const handleToggle = () => (open ? handleClose() : setOpen(true));

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 5, left: rect.left - 150 });
  };

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      )
        handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const openModal = (mode: ModalMode) => {
    setValues(applicant.formData ?? {});
    setError(null);
    setModalMode(mode);
    handleClose();
  };

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setModalMode(null);
      setModalClosing(false);
      setError(null);
    }, 150);
  };

  useEffect(() => {
    document.body.style.overflow = modalMode ? 'hidden' : '';
  }, [modalMode]);

  useEffect(() => {
    if (!modalMode) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modalMode]);

  const handleSave = async () => {
    if (!activeForm) return;
    setSaving(true);
    setError(null);
    try {
      const quick = extractQuickFields(activeForm.fields, values);
      let documents: { name: string; status: 'done' | 'missing' }[] = [];
      try {
        const docsRes = await fetch('http://localhost:3000/documents');
        const allDocs = await docsRes.json();
        const allDocNames: string[] = allDocs.map((d: any) => d.name);
        documents = allDocNames.map((name) => ({
          name,
          status: quick.checkedDocuments.includes(name) ? 'done' : 'missing',
        }));
      } catch {}

      const res = await fetch(
        `http://localhost:3000/applicants/${applicant.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ formData: values, ...quick, documents }),
        },
      );
      if (!res.ok) throw new Error();
      closeModal();
      onUpdated?.();
    } catch {
      setError('Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Удалить абитуриента ${applicant.fullName || applicant.caseNumber}?`,
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:3000/applicants/${applicant.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error();
      onDeleted?.();
    } catch {
      alert('Не удалось удалить запись.');
    } finally {
      setDeleting(false);
    }
  };

  const modalTitle =
    modalMode === 'view'
      ? `Анкета: ${applicant.fullName || applicant.caseNumber}`
      : `Редактирование: ${applicant.fullName || applicant.caseNumber}`;

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggle}
        disabled={deleting}
        className="hover:bg-gray-200 p-2 rounded-full disabled:opacity-50"
      >
        <EllipsisVertical size={24} />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{ top: position.top, left: position.left }}
          >
            <div
              ref={menuRef}
              className={`bg-white w-40 border border-gray-300 rounded-xl shadow-lg overflow-hidden ${
                isClosing ? 'animate-fade-out' : 'animate-fade-in'
              }`}
            >
              <button
                onClick={() => openModal('view')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <div className="flex items-center gap-4">
                  <Eye size={20} />
                  <p className="text-sm">Посмотреть</p>
                </div>
              </button>
              <AdminRoute>
                <button
                  onClick={() => openModal('edit')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <SquarePen size={20} />
                    <p className="text-sm">Изменить</p>
                  </div>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  <div className="flex items-center gap-4">
                    <Trash size={20} />
                    <p className="text-sm">Удалить</p>
                  </div>
                </button>
              </AdminRoute>
            </div>
          </div>,
          document.body,
        )}
      {modalMode &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl ${
                modalClosing
                  ? 'animate-fade-out-scale'
                  : 'animate-fade-in-scale'
              }`}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-10">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText size={20} className="text-blue-600" />
                  {modalTitle}
                </h2>
                <div className="flex items-center gap-2">
                  {modalMode === 'view' && (
                    <AdminRoute>
                      <button
                        onClick={() => setModalMode('edit')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        <SquarePen size={14} />
                        Редактировать
                      </button>
                    </AdminRoute>
                  )}
                  {modalMode === 'edit' && (
                    <button
                      onClick={() => setModalMode('view')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      <Eye size={14} />
                      Просмотр
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-gray-400 mb-4">
                  № дела:{' '}
                  <span className="font-medium text-gray-600">
                    {applicant.caseNumber}
                  </span>
                </p>

                {activeForm ? (
                  <ApplicantFormContent
                    form={activeForm}
                    values={values}
                    setValues={setValues}
                    readOnly={modalMode === 'view'}
                  />
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Загрузка формы...
                  </p>
                )}

                {error && (
                  <p className="mt-4 text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}

                {modalMode === 'edit' && activeForm && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition"
                  >
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
