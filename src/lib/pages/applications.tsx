import { LogOut, Users, ChartColumn, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ApplicantDocuments } from '../components/ApplicantDocument';
import type { DocumentItem } from '../components/ApplicantDocument';
import { ModalButton } from '../components/ModalButton';
import { ExportButton } from '../components/ExportButton';
import { ApplicantForm } from '../components/ApplicantFormModal';
import { FilterDropdown } from '../components/FilterDropDown';

interface Applicant {
  id: number;
  documents: DocumentItem[];
  fullName: string;
  classes: string;
  profession: string;
  finance: string;
  point: number;
  benefit: string;
  note: string;
}

const statisticsConfig = [
  {
    colorBlock: 'bg-blue-500/10',
    colorText: 'text-blue-600',
    lable: 'Подано всего 9 класс на бюджет',
    count: 1,
  },
  {
    colorBlock: 'bg-green-500/10',
    colorText: 'text-green-600',
    lable: 'Подано 9 класс с оригиналом аттестата',
    count: 0,
  },
  {
    colorBlock: 'bg-red-500/10',
    colorText: 'text-red-600',
    lable: '9 класс на коммерцию',
    count: 1,
  },
    {
    colorBlock: 'bg-blue-500/10',
    colorText: 'text-blue-600',
    lable: 'Подано всего 11 класс на бюджет',
    count: 1,
  },
  {
    colorBlock: 'bg-green-500/10',
    colorText: 'text-green-600',
    lable: 'Подано 11 класс с оригиналом аттестата',
    count: 0,
  },
  {
    colorBlock: 'bg-red-500/10',
    colorText: 'text-red-600',
    lable: '11 класс на коммерцию',
    count: 1,
  },
];

export const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({
    id: [],
    docStatus: [],
    fullName: [],
    classes: [],
    profession: [],
    finance: [],
    point: [],
    benefit: [],
  });

  const applicants: Applicant[] = [
    {
      id: 1,
      documents: [
        { name: 'Заявление абитуриента', status: 'done' },
        { name: 'Согласие (абитуриент)', status: 'done' },
        { name: 'Согласие (родитель)', status: 'done' },
        { name: 'Аттестат (оригинал)', status: 'done' },
        { name: 'Копия аттестата', status: 'missing' },
        { name: 'Копия паспорта', status: 'done' },
        { name: 'Фото', status: 'done' },
        { name: 'Мед. справка', status: 'done' },
        { name: 'ФЛГ', status: 'done' },
        { name: 'Копия карты прививок', status: 'done' },
        { name: 'Копия СНИЛС', status: 'done' },
        { name: 'ИНН', status: 'done' },
      ],
      fullName: 'Грязев Егор Сергеевич',
      classes: '9',
      profession: '09.02.11 Информационные системы и программирование',
      finance: 'К',
      point: 3.8,
      benefit: '-',
      note: 'Закончил Рязанский колледж электроники с отличием',
    },
    {
      id: 2,
      documents: [
        { name: 'Заявление абитуриента', status: 'done' },
        { name: 'Согласие (абитуриент)', status: 'done' },
        { name: 'Согласие (родитель)', status: 'missing' },
        { name: 'Аттестат (оригинал)', status: 'missing' },
        { name: 'Копия аттестата', status: 'done' },
        { name: 'Копия паспорта', status: 'done' },
        { name: 'Фото', status: 'done' },
        { name: 'Мед. справка', status: 'done' },
        { name: 'ФЛГ', status: 'done' },
        { name: 'Копия карты прививок', status: 'done' },
        { name: 'Копия СНИЛС', status: 'done' },
        { name: 'ИНН', status: 'done' },
      ],
      fullName: 'Баранов Никита Андреевич',
      classes: '11',
      profession: '09.02.11 Информационные системы и программирование',
      finance: 'Б',
      point: 5,
      benefit: 'Слишком крут для этого',
      note: 'Закончил Рязанский колледж электроники с отличием',
    },
  ];

  const uniqueValues = {
    id: [...new Set(applicants.map((a) => String(a.id)))],
    docStatus: ['Оригинал', 'Копия'],
    fullName: [...new Set(applicants.map((a) => a.fullName))],
    classes: [...new Set(applicants.map((a) => a.classes))],
    profession: [...new Set(applicants.map((a) => a.profession))],
    finance: [...new Set(applicants.map((a) => a.finance))],
    point: [...new Set(applicants.map((a) => String(a.point)))],
    benefit: [...new Set(applicants.map((a) => a.benefit))],
  };

  const handleFilterChange = (key: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  };

  const getCertificateStatus = (docs: DocumentItem[]) => {
    const original = docs.find((d) => d.name === 'Аттестат (оригинал)');
    const copy = docs.find((d) => d.name === 'Копия аттестата');
    if (original?.status === 'done') return 'Оригинал';
    if (copy?.status === 'done') return 'Копия';
    return 'Нет';
  };

  const filteredApplicants = applicants.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.fullName.toLowerCase().includes(term) || a.id.toString().includes(term);

    const matchesFilters = [
      filters.id.length === 0 || filters.id.includes(String(a.id)),
      filters.docStatus.length === 0 ||
        filters.docStatus.includes(getCertificateStatus(a.documents)),
      filters.fullName.length === 0 || filters.fullName.includes(a.fullName),
      filters.classes.length === 0 || filters.classes.includes(a.classes),
      filters.profession.length === 0 ||
        filters.profession.includes(a.profession),
      filters.finance.length === 0 || filters.finance.includes(a.finance),
      filters.point.length === 0 || filters.point.includes(String(a.point)),
      filters.benefit.length === 0 || filters.benefit.includes(a.benefit),
    ].every(Boolean);

    return matchesSearch && matchesFilters;
  });

  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);

  const resetAllFilters = () => {
    setFilters({
      id: [],
      docStatus: [],
      fullName: [],
      classes: [],
      profession: [],
      finance: [],
      point: [],
      benefit: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <div className="flex-1 mx-auto w-full max-w-[95rem] px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-semibold">Панель управления</h1>
              <p className="text-sm sm:text-base">
                Управление анкетами абитуриентов
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/Statistic"
              className="bg-gray-200 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm"
            >
              <ChartColumn size={16} />
              Статистика
            </Link>
            <ApplicantForm />
            <Link
              to="/"
              className="bg-gray-300 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm"
            >
              <LogOut size={16} />
              Выйти
            </Link>
          </div>
        </header>
        <main className="py-4 sm:py-6 lg:py-8 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="font-medium text-gray-900 text-sm sm:text-base pb-5">
                Статистика
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statisticsConfig.map((item, index) => (
                  <div key={index}>
                    <section>
                      <div
                        className={`px-6 py-6 rounded-xl ${item.colorBlock}`}
                      >
                        <p className={`text-sm ${item.colorText}`}>
                          {item.lable}
                        </p>
                        <h1 className="text-3xl sm:text-4xl text-gray-700">
                          {item.count}
                        </h1>
                      </div>
                    </section>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='p-4 bg-white rounded-xl border border-gray-300 shadow'>
            <input
              type="text"
              placeholder="Поиск по имени или ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 shadow focus:outline-none rounded-xl p-2 w-full"
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-x-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex item-center justify-between">
              <div>
                <h2 className="font-medium text-gray-900 text-sm sm:text-base">
                  Список абитуриентов
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Всего записей: {filteredApplicants.length}
                  {filteredApplicants.length !== applicants.length && (
                    <span className="text-gray-400">
                      {' '}
                      (из {applicants.length})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ExportButton />
                <button className="transition-all duration-300 bg-red-600 p-2 rounded-xl border border-red-600 text-white text-sm hover:bg-white hover:text-red-600">
                  Удалить
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                  >
                    <X size={12} className='p-1 bg-gray-100'/>
                    Сбросить фильтры
                  </button>
                )}
              </div>
            </div>
            <table className="w-full min-w-[700px] sm:min-w-full text-xs sm:text-sm border-collapse border-spacing-y-3">
              <thead className="text-left text-gray-600">
                <tr className="border-b border-gray-200 text-center">
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>№ дела</span>
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>Список документов</span>
                      <FilterDropdown
                        label="Список документов"
                        options={uniqueValues.docStatus}
                        selected={filters.docStatus}
                        onChange={(vals) =>
                          handleFilterChange('docStatus', vals)
                        }
                      />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>ФИО</span>
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>Классы</span>
                      <FilterDropdown
                        label="Классы"
                        options={uniqueValues.classes}
                        selected={filters.classes}
                        onChange={(vals) => handleFilterChange('classes', vals)}
                      />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>Специальность</span>
                      <FilterDropdown
                        label="Специальность"
                        options={uniqueValues.profession}
                        selected={filters.profession}
                        onChange={(vals) =>
                          handleFilterChange('profession', vals)
                        }
                      />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>Финансирование</span>
                      <FilterDropdown
                        label="Финансирование"
                        options={uniqueValues.finance}
                        selected={filters.finance}
                        onChange={(vals) => handleFilterChange('finance', vals)}
                      />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>Средний балл</span>
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>Льготы</span>
                      <FilterDropdown
                        label="Льготы"
                        options={uniqueValues.benefit}
                        selected={filters.benefit}
                        onChange={(vals) => handleFilterChange('benefit', vals)}
                      />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-2">Примечание</th>
                  <th className="px-2 sm:px-4 py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-10 sm:py-12 text-gray-500"
                    >
                      {hasActiveFilters
                        ? 'Нет записей, соответствующих фильтрам'
                        : 'Нет записей'}
                    </td>
                  </tr>
                )}
                {filteredApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gray-100 text-center"
                  >
                    <td className="px-2 sm:px-6 py-2 text-center">
                      {applicant.id}
                    </td>
                    <td className="px-2 sm:px-6 py-2 max-w-[150px] sm:max-w-[250px]">
                      <ApplicantDocuments
                        applicantId={applicant.id}
                        documents={applicant.documents}
                      />
                    </td>
                    <td className="px-2 sm:px-6 py-2">{applicant.fullName}</td>
                    <td className="px-2 sm:px-6 py-2">{applicant.classes}</td>
                    <td className="px-2 sm:px-6 py-2 text-center">
                      {applicant.profession}
                    </td>
                    <td className="px-2 sm:px-6 py-2 max-w-[150px] sm:max-w-[300px]">
                      {applicant.finance}
                    </td>
                    <td className="px-2 sm:px-6 py-2">{applicant.point}</td>
                    <td className="px-2 sm:px-6 py-2">{applicant.benefit}</td>
                    <td className="px-2 sm:px-6 py-2">{applicant.note}</td>
                    <td className="px-2 sm:px-6 py-2 text-center">
                      <ModalButton />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};
