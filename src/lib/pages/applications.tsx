import {
  LogOut,
  Users,
  ChartColumn,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApplicantDocuments } from '../components/ApplicantDocument';
import type { DocumentItem } from '../components/ApplicantDocument';
import { ModalButton } from '../components/ModalButton';
import { ExportButton } from '../components/ExportButton';
import { ApplicantForm } from '../components/ApplicantFormModal';

interface Applicant {
  id: number;
  note: string;
  fullName: string;
  address: string;
  classes: string;
  profession: string;
  documents: DocumentItem[];
  date: string;
}

const statisticsConfig = [
  {
    colorBlock: 'bg-blue-500/10',
    colorText: 'text-blue-600',
    lable: 'Всего абитуриентов',
    count: 1,
  },
  {
    colorBlock: 'bg-green-500/10',
    colorText: 'text-green-600',
    lable: 'Полный комплект документов',
    count: 0,
  },
  {
    colorBlock: 'bg-red-500/10',
    colorText: 'text-red-600',
    lable: 'Неполный комплект документов',
    count: 1,
  },
];

export const DashboardPage = () => {
  const applicants: Applicant[] = [
    {
      id: 1,
      note: 'Закончил Рязанский колледж электроники с отличием',
      fullName: 'Грязев Егор Сергеевич',
      address: 'г. Рязань',
      classes: '9',
      profession: '09.02.06 Информационные системы и программирование',
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
      date: '11.04.2006',
    },
    {
      id: 2,
      note: 'Закончил Рязанский колледж электроники с отличием',
      fullName: 'Баранов Никита Андреевич',
      address: 'г. Рязань',
      classes: '11',
      profession: '09.02.06 Информационные системы и программирование',
      documents: [
        { name: 'Заявление абитуриента', status: 'missing' },
        { name: 'Согласие (абитуриент)', status: 'done' },
        { name: 'Согласие (родитель)', status: 'done' },
        { name: 'Аттестат (оригинал)', status: 'done' },
        { name: 'Копия аттестата', status: 'missing' },
        { name: 'Копия паспорта', status: 'done' },
        { name: 'Фото', status: 'done' },
        { name: 'Мед. справка', status: 'missing' },
        { name: 'ФЛГ', status: 'done' },
        { name: 'Копия карты прививок', status: 'done' },
        { name: 'Копия СНИЛС', status: 'done' },
        { name: 'ИНН', status: 'done' },
      ],
      date: '-',
    },
  ];

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
          <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-x-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex item-center justify-between">
              <div>
                <h2 className="font-medium text-gray-900 text-sm sm:text-base">
                  Список абитуриентов
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Всего записей: {applicants.length}
                </p>
              </div>
              <ExportButton />
            </div>
            <table className="w-full min-w-[700px] sm:min-w-full text-xs sm:text-sm border-collapse border-spacing-y-3">
              <thead className="text-left text-gray-600">
                <tr className="border-b border-gray-200 text-center">
                  <th className="px-2 sm:px-4 py-2">№ дела</th>
                  <th className="px-2 sm:px-4 py-2">Примечание</th>
                  <th className="px-2 sm:px-4 py-2">ФИО</th>
                  <th className="px-2 sm:px-4 py-2">Адрес</th>
                  <th className="px-2 sm:px-4 py-2">Классы</th>
                  <th className="px-2 sm:px-4 py-2">Специальность</th>
                  <th className="px-2 sm:px-4 py-2">Список документов</th>
                  <th className="px-2 sm:px-4 py-2">Дата рождения</th>
                  <th className="px-2 sm:px-4 py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 sm:py-12 text-gray-500"
                    >
                      Нет записей
                    </td>
                  </tr>
                )}
                {applicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gray-100 text-center"
                  >
                    <td className="px-2 sm:px-6 py-2 text-center">
                      {applicant.id}
                    </td>
                    <td className="px-2 sm:px-6 py-2 max-w-[150px] sm:max-w-[250px]">
                      {applicant.note}
                    </td>
                    <td className="px-2 sm:px-6 py-2">{applicant.fullName}</td>
                    <td className="px-2 sm:px-6 py-2">{applicant.address}</td>
                    <td className="px-2 sm:px-6 py-2 text-center">
                      {applicant.classes}
                    </td>
                    <td className="px-2 sm:px-6 py-2 max-w-[150px] sm:max-w-[300px]">
                      {applicant.profession}
                    </td>
                    <td className="px-2 sm:px-6 py-2">
                      <div className="flex justify-center">
                        <ApplicantDocuments
                          applicantId={applicant.id}
                          documents={applicant.documents}
                        />
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2">{applicant.date}</td>
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
