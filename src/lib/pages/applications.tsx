import { LogOut, Users, ChartColumn, ShieldCheck, Download, FileText, FileSpreadsheet, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ApplicantDocuments } from '../components/ApplicantDocument';
import type { DocumentItem } from '../components/ApplicantDocument';
import { ModalButton } from '../components/ModalButton';
import { ApplicantForm } from '../components/ApplicantFormModal';
import { FilterDropdown } from '../components/FilterDropDown';
import { AdminRoute } from '../components/AdminRoute';
import { ClearDatabaseButton } from '../components/ClearDatabaseButton';
import type { FormField } from '../components/ApplicantFormModal';

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
  createdAt: string;
  documents: DocumentItem[];
}

const countableDocLabels = [
  'Копия аттестат',
  'Копия паспорт',
  'Фото',
  'Копия карты прививок',
  'Копия СНИЛС',
];

const getDocCount = (docs: DocumentItem[] | undefined, label: string): number | '' => {
  if (!docs?.length) return '';
  const target = label.toLowerCase();
  const item = docs.find((d) => String(d.name ?? '').toLowerCase().includes(target));
  const n = item && item.status === 'done' ? Number((item as any).count ?? 0) : 0;
  return n > 0 ? n : '';
};

interface FilterState {
  docStatus: string[];
  classes: string[];
  profession: string[];
  finance: string[];
  point: string[];
  benefit: string[];
}

const statisticsConfig = [
  { key: 'grade9_budget_total', colorBlock: 'bg-blue-50', colorText: 'text-blue-600', colorNum: 'text-blue-700', lable: 'Подано всего 9 класс на бюджет', count: 0 },
  { key: 'grade9_budget_attest_original', colorBlock: 'bg-emerald-50', colorText: 'text-emerald-600', colorNum: 'text-emerald-700', lable: 'Подано 9 класс с оригиналом аттестата', count: 0 },
  { key: 'grade9_commerce_total', colorBlock: 'bg-rose-50', colorText: 'text-rose-600', colorNum: 'text-rose-700', lable: '9 класс на коммерцию', count: 0 },
  { key: 'grade11_budget_total', colorBlock: 'bg-blue-50', colorText: 'text-blue-600', colorNum: 'text-blue-700', lable: 'Подано всего 11 класс на бюджет', count: 0 },
  { key: 'grade11_budget_attest_original', colorBlock: 'bg-emerald-50', colorText: 'text-emerald-600', colorNum: 'text-emerald-700', lable: 'Подано 11 класс с оригиналом аттестата', count: 0 },
  { key: 'grade11_commerce_total', colorBlock: 'bg-rose-50', colorText: 'text-rose-600', colorNum: 'text-rose-700', lable: '11 класс на коммерцию', count: 0 },
];

const EMPTY_FILTERS: FilterState = {
  docStatus: [], classes: [],
  profession: [], finance: [], point: [], benefit: [],
};

// ─── Helpers ───────────────────────────────────────────────────────────

// Очищает значение от кавычек, скобок и лишней структуры
const cleanDisplayValue = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    return value
      .replace(/^["']|["']$/g, '')
      .replace(/^\{|\}$/g, '')
      .replace(/\\["']/g, '"')
      .replace(/(?:label|value)\s*:\s*"?([^",}]+)"?/i, '$1')
      .trim();
  }
  if (typeof value === 'object' && value !== null) {
    return (value as any).label || (value as any).value || JSON.stringify(value);
  }
  return String(value);
};

// Нормализует список льгот из строки/массива (чтобы не "слипалось")
const parseBenefits = (value: unknown): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  const s = String(value)
    .trim()
    .replace(/^\[|\]$/g, '')
    .replace(/^["']|["']$/g, '');
  if (!s) return [];
  return s
    .split(/[,;/\n]+/)
    .map(x => x.trim().replace(/^["']|["']$/g, ''))
    .map(x => x.replace(/\s+/g, ' '))
    .filter(Boolean);
};

const computePointFromGpa = (formData: Record<string, any> | undefined | null): number | undefined => {
  if (!formData) return undefined;
  // Find any gpa-like object with n2..n5 or grades[]
  for (const v of Object.values(formData)) {
    if (!v) continue;
    if (typeof v === 'object') {
      const n2 = Math.max(0, parseInt(String((v as any).n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String((v as any).n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String((v as any).n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String((v as any).n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      if (total > 0) return (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total;

      const grades: any[] = Array.isArray((v as any).grades) ? (v as any).grades : [];
      if (grades.length) {
        const nums = grades
          .map((x) => Number(String(x).replace(',', '.')))
          .filter((n) => Number.isFinite(n));
        if (nums.length) return nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    }
  }
  return undefined;
};

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function getActiveFormFields(token: string | null): Promise<FormField[]> {
  try {
    const res = await fetch('http://localhost:3000/forms/active', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return [];
    const form = await res.json();
    return form?.fields || [];
  } catch {
    return [];
  }
}

const PERSON_SUBFIELDS: { key: string; label: string }[] = [
  { key: 'lastName', label: 'Фамилия' },
  { key: 'firstName', label: 'Имя' },
  { key: 'middleName', label: 'Отчество' },
  { key: 'address', label: 'Адрес' },
  { key: 'phone', label: 'Телефон' },
  { key: 'workplace', label: 'Место работы' },
  { key: 'position', label: 'Должность' },
];

function flattenFormDataForExport(formData: Record<string, any>, fields: FormField[]): Record<string, string> {
  const out: Record<string, string> = {};
  fields.forEach((f) => {
    if (['heading', 'group'].includes(f.type)) return;
    const raw = formData?.[f.id];
    if (f.type === 'person' && raw && typeof raw === 'object') {
      PERSON_SUBFIELDS.forEach((sf) => {
        const col = `${f.label}: ${sf.label}`;
        out[col] = cleanDisplayValue((raw as any)[sf.key] ?? '');
      });
      return;
    }
    if (f.type === 'gpa' && raw && typeof raw === 'object') {
      const n2 = Math.max(0, parseInt(String((raw as any).n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String((raw as any).n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String((raw as any).n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String((raw as any).n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      const avg = total ? (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total : NaN;
      out[`${f.label}: Двоек`] = String(n2 || '');
      out[`${f.label}: Троек`] = String(n3 || '');
      out[`${f.label}: Четвёрок`] = String(n4 || '');
      out[`${f.label}: Пятёрок`] = String(n5 || '');
      out[`${f.label}: Средний балл`] = Number.isFinite(avg) ? avg.toFixed(2) : '';
      return;
    }
    if (Array.isArray(raw)) {
      out[f.label] = raw.filter(Boolean).join('; ');
      return;
    }
    if (raw !== null && raw !== undefined) {
      out[f.label] = cleanDisplayValue(raw);
      return;
    }
    out[f.label] = '';
  });
  return out;
}

async function fetchAllApplicantsForExport(token: string | null): Promise<Applicant[]> {
  const all: Applicant[] = [];
  const limit = 500;
  let page = 1;
  let total = Infinity;

  while (all.length < total) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    const res = await fetch(`http://localhost:3000/applicants?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error('export_fetch_failed');
    const data = await res.json();
    const items: Applicant[] = Array.isArray(data) ? data : (data.items ?? []);
    total = Array.isArray(data) ? items.length : Number(data.total ?? items.length);

    all.push(...items.map((a: any) => ({ ...a, documents: a.documents ?? [] })));
    if (items.length === 0) break;
    page += 1;
    if (page > 10000) break;
  }

  return all;
}

async function exportAllApplicantsCSV(token: string | null) {
  const [fields, applicants] = await Promise.all([
    getActiveFormFields(token),
    fetchAllApplicantsForExport(token),
  ]);

  const baseHeaders = [
    '№ дела',
    'ФИО',
    'Классы',
    'Специальность',
    'Финансирование',
    'Средний балл',
    'Льготы',
    'Примечание',
    'Дата подачи',
    ...countableDocLabels.map((x) => `${x} (кол-во)`),
  ];

  const formHeaders: string[] = [];
  fields.forEach((f) => {
    if (['heading', 'group'].includes(f.type)) return;
    if (f.type === 'person') {
      PERSON_SUBFIELDS.forEach((sf) => formHeaders.push(`${f.label}: ${sf.label}`));
    } else if (f.type === 'gpa') {
      formHeaders.push(`${f.label}: Двоек`, `${f.label}: Троек`, `${f.label}: Четвёрок`, `${f.label}: Пятёрок`, `${f.label}: Средний балл`);
    } else {
      formHeaders.push(f.label);
    }
  });

  const headers = [...baseHeaders, ...formHeaders];
  const rows = applicants.map((a) => {
    const p = a.point ?? computePointFromGpa(a.formData);
    const baseRow = [
      a.caseNumber,
      a.fullName,
      a.classes,
      a.profession,
      cleanDisplayValue(a.finance),
      Number.isFinite(p as number) ? (p as number).toFixed(2) : '',
      parseBenefits(a.benefit).join('; '),
      a.note,
      new Date(a.createdAt).toLocaleDateString('ru-RU'),
      ...countableDocLabels.map((lbl) => getDocCount(a.documents, lbl)),
    ];
    const flat = flattenFormDataForExport(a.formData ?? {}, fields);
    const formRow = formHeaders.map((h) => flat[h] ?? '');
    return [...baseRow, ...formRow].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
  });

  const bom = '\uFEFF';
  const blob = new Blob([bom + [headers.map(h => `"${h}"`).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `applicants_full_export_${new Date().toISOString().slice(0, 10)}.csv`);
}

async function exportAllApplicantsXLSX(token: string | null) {
  const XLSX = await import('xlsx');
  const [fields, applicants] = await Promise.all([
    getActiveFormFields(token),
    fetchAllApplicantsForExport(token),
  ]);
  const baseHeaders = [
    '№ дела',
    'ФИО',
    'Классы',
    'Специальность',
    'Финансирование',
    'Средний балл',
    'Льготы',
    'Примечание',
    'Дата подачи',
    ...countableDocLabels.map((x) => `${x} (кол-во)`),
  ];

  const formHeaders: string[] = [];
  fields.forEach((f) => {
    if (['heading', 'group'].includes(f.type)) return;
    if (f.type === 'person') PERSON_SUBFIELDS.forEach((sf) => formHeaders.push(`${f.label}: ${sf.label}`));
    else if (f.type === 'gpa') formHeaders.push(`${f.label}: Двоек`, `${f.label}: Троек`, `${f.label}: Четвёрок`, `${f.label}: Пятёрок`, `${f.label}: Средний балл`);
    else formHeaders.push(f.label);
  });

  const headers = [...baseHeaders, ...formHeaders];
  const wsData = [headers, ...applicants.map((a) => {
    const p = a.point ?? computePointFromGpa(a.formData);
    const baseRow = [
      a.caseNumber,
      a.fullName,
      a.classes,
      a.profession,
      cleanDisplayValue(a.finance),
      Number.isFinite(p as number) ? (p as number).toFixed(2) : '',
      parseBenefits(a.benefit).join('; '),
      a.note,
      new Date(a.createdAt).toLocaleDateString('ru-RU'),
      ...countableDocLabels.map((lbl) => getDocCount(a.documents, lbl)),
    ];
    const flat = flattenFormDataForExport(a.formData ?? {}, fields);
    const formRow = formHeaders.map((h) => flat[h] ?? '');
    return [...baseRow, ...formRow];
  })];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Абитуриенты');
  XLSX.writeFile(wb, `applicants_full_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function exportAllApplicantsPDF(token: string | null) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const [fields, applicants] = await Promise.all([
    getActiveFormFields(token),
    fetchAllApplicantsForExport(token),
  ]);

  const baseHeaders = [
    '№ дела',
    'ФИО',
    'Классы',
    'Специальность',
    'Финансирование',
    'Балл',
    'Льготы',
    'Примечание',
    ...countableDocLabels.map((x) => `${x} (кол-во)`),
  ];
  const formHeaders: string[] = [];
  fields.forEach((f) => {
    if (['heading', 'group'].includes(f.type)) return;
    if (f.type === 'person') PERSON_SUBFIELDS.forEach((sf) => formHeaders.push(`${f.label}: ${sf.label}`));
    else if (f.type === 'gpa') formHeaders.push(`${f.label}: Двоек`, `${f.label}: Троек`, `${f.label}: Четвёрок`, `${f.label}: Пятёрок`, `${f.label}: Средний балл`);
    else formHeaders.push(f.label);
  });
  const headers = [...baseHeaders, ...formHeaders];

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  autoTable(doc, {
    head: [headers],
    body: applicants.map((a) => {
      const p = a.point ?? computePointFromGpa(a.formData);
      const baseRow = [
        a.caseNumber,
        a.fullName,
        a.classes,
        a.profession,
        cleanDisplayValue(a.finance),
        Number.isFinite(p as number) ? (p as number).toFixed(2) : '',
        parseBenefits(a.benefit).join('; '),
        a.note,
        ...countableDocLabels.map((lbl) => getDocCount(a.documents, lbl)),
      ];
      const flat = flattenFormDataForExport(a.formData ?? {}, fields);
      const formRow = formHeaders.map((h) => flat[h] ?? '');
      return [...baseRow, ...formRow];
    }),
    styles: { font: 'helvetica', fontSize: 7, cellWidth: 'wrap' },
    margin: { top: 15 },
  });
  doc.save(`applicants_full_export_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = async (kind: 'csv' | 'xlsx' | 'pdf') => {
    setExporting(true);
    try {
      if (kind === 'csv') await exportAllApplicantsCSV(token);
      if (kind === 'xlsx') await exportAllApplicantsXLSX(token);
      if (kind === 'pdf') await exportAllApplicantsPDF(token);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm font-medium text-gray-700"
      >
        <Download size={13} />
        {exporting ? 'Экспорт…' : 'Экспорт'}
        <svg className={`w-3 h-3 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <button onClick={() => run('csv')} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700 text-left">
            <FileText size={14} className="text-green-500" /> Экспорт CSV
          </button>
          <button onClick={() => run('xlsx')} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700 text-left">
            <FileSpreadsheet size={14} className="text-emerald-600" /> Экспорт XLSX
          </button>
          <button onClick={() => run('pdf')} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700 text-left">
            <FileText size={14} className="text-red-500" /> Экспорт PDF
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Benefit badges (единый стиль) ───────────────────────────────────

function BenefitBadges({ value }: { value: string | string[] | null | undefined }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const items = parseBenefits(value);
  
  if (items.length === 0) return <span className="text-gray-400">—</span>;
  
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap">
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({
    id: [], docStatus: ['Оригинал', 'Копия'], fullName: [],
    classes: [], profession: [], finance: [], point: [], benefit: [],
  });

  const token = localStorage.getItem('access_token');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Build query params
  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) {
      p.set('search', debouncedSearch);
      p.set('query', debouncedSearch);
    }
    if (filters.docStatus?.length) p.set('docStatus', filters.docStatus.join(','));
    if (filters.classes?.length) p.set('classes', filters.classes.join(','));
    if (filters.profession?.length) p.set('profession', filters.profession.join(','));
    if (filters.finance?.length) p.set('finance', filters.finance.join(','));
    if (filters.point?.length) p.set('point', filters.point.join(','));
    if (filters.benefit?.length) p.set('benefit', filters.benefit.join(','));
    return p;
  }, [filters, debouncedSearch]);

  // Fetch applicants
  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const res = await fetch(`http://localhost:3000/applicants?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplicants(data.map((a: any) => ({ ...a, documents: a.documents ?? [] })));
        setTotal(data.length);
      } else {
        setApplicants((data.items ?? []).map((a: any) => ({ ...a, documents: a.documents ?? [] })));
        setTotal(data.total ?? data.items?.length ?? 0);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setApplicants([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, buildParams]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/applicants/filter-options', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFilterOptions(prev => ({ ...prev, ...data }));
    } catch { /* ignore */ }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/applicants/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data ?? {});
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const handleFilterChange = (key: string, values: string[]) => {
    setFilters(prev => ({ ...prev, [key]: values }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v.length > 0) || !!debouncedSearch;
  const resetAllFilters = () => { setFilters(EMPTY_FILTERS); setSearchTerm(''); };
  const handleLogout = () => { localStorage.removeItem('access_token'); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <div className="flex-1 mx-auto w-full max-w-[96rem] px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
              <Users className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Панель управления</h1>
              <p className="text-xs sm:text-sm text-gray-500">Управление анкетами абитуриентов</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminRoute>
              <Link to="/Admin" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm">
                <ShieldCheck size={14} /> Админ
              </Link>
            </AdminRoute>
            <Link to="/Statistic" className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors shadow-sm">
              <ChartColumn size={14} /> Статистика
            </Link>
            <ApplicantForm onCreated={fetchApplicants} />
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors shadow-sm">
              <LogOut size={14} /> Выйти
            </button>
          </div>
        </header>

        <main className="pb-8 space-y-4">
          {/* Statistics */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="font-semibold text-gray-800 text-sm mb-4">Статистика</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
              {statisticsConfig.map((item, index) => (
                <div key={index} className={`${item.colorBlock} rounded-xl px-4 py-4 sm:py-5`}>
                  <p className={`text-xs sm:text-sm ${item.colorText} leading-snug`}>{item.lable}</p>
                  <p className={`text-3xl sm:text-4xl font-bold mt-1 ${item.colorNum}`}>{stats[(item as any).key] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по имени или № дела…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 rounded-xl text-sm placeholder:text-gray-400 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Список абитуриентов</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Показано: {applicants.length}
                  {applicants.length !== total && <span> · Всего в базе: {total}</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ExportDropdown />
                <AdminRoute>
                  <ClearDatabaseButton onCleared={fetchApplicants} />
                </AdminRoute>
                {hasActiveFilters && (
                  <button onClick={resetAllFilters} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors">
                    <X size={11} /> Сбросить фильтры
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse" style={{ minWidth: 760 }}>
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-gray-500 text-center">
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      № дела
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">Документы
                        <FilterDropdown label="Список документов" options={filterOptions.docStatus} selected={filters.docStatus} onChange={vals => handleFilterChange('docStatus', vals)} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      ФИО
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">Классы
                        <FilterDropdown label="Классы" options={filterOptions.classes} selected={filters.classes} onChange={vals => handleFilterChange('classes', vals)} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">Специальность
                        <FilterDropdown label="Специальность" options={filterOptions.profession} selected={filters.profession} onChange={vals => handleFilterChange('profession', vals)} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">Финансирование
                        <FilterDropdown label="Финансирование" options={filterOptions.finance} selected={filters.finance} onChange={vals => handleFilterChange('finance', vals)} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">Ср. балл
                        <FilterDropdown label="Средний балл" options={filterOptions.point} selected={filters.point} onChange={vals => handleFilterChange('point', vals)} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">Льготы
                        <FilterDropdown label="Льготы" options={filterOptions.benefit} selected={filters.benefit} onChange={vals => handleFilterChange('benefit', vals)} />
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Примечание</th>
                    <th className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading && (
                    <tr><td colSpan={10} className="text-center py-16 text-gray-400 text-sm"><div className="flex flex-col items-center gap-2"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />Загрузка…</div></td></tr>
                  )}
                  {!loading && applicants.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-16 text-gray-400 text-sm">{hasActiveFilters ? 'Нет записей, соответствующих фильтрам' : 'Нет записей'}</td></tr>
                  )}
                  {!loading && applicants.map(applicant => (
                    <tr key={applicant.id} className="hover:bg-blue-50/30 transition-colors text-center group">
                      <td className="px-3 sm:px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{applicant.caseNumber || '—'}</td>
                      <td className="px-3 sm:px-4 py-2.5 max-w-[160px] sm:max-w-[220px]">
                        <ApplicantDocuments applicantId={String(applicant.id)} documents={applicant.documents} />
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-left whitespace-nowrap text-gray-800">{applicant.fullName || '—'}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">{applicant.classes || '—'}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-left max-w-[160px]"><span className="block truncate" title={applicant.profession}>{applicant.profession || '—'}</span></td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">
                        {applicant.finance ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            cleanDisplayValue(applicant.finance).toLowerCase().includes('бюджет') ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {cleanDisplayValue(applicant.finance)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 font-medium">
                        {(() => {
                          const p = applicant.point ?? computePointFromGpa(applicant.formData);
                          return Number.isFinite(p as number) ? (p as number).toFixed(2) : '—';
                        })()}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 max-w-[160px]"><BenefitBadges value={applicant.benefit} /></td>
                      <td className="px-3 sm:px-4 py-2.5 text-gray-500 text-left max-w-[140px]"><span className="block truncate" title={applicant.note}>{applicant.note || '—'}</span></td>
                      <td className="px-3 sm:px-4 py-2.5"><ModalButton applicant={applicant} onDeleted={fetchApplicants} onUpdated={fetchApplicants} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};