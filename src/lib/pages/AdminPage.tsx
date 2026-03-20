import { useState } from 'react';
import { Users, BookOpen, Award, FileText, LogOut, Shield, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UsersSectionPage } from './UsersSection';
import { SpecialitiesSectionPage } from './SpecialitiesSection';
import { BenefitsSectionPage } from './BenefitSection';
import { DocumentsSectionPage } from './DocumentsSection';

type Section = 'users' | 'specialities' | 'benefits' | 'documents';

export const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<Section>('users');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'specialities', label: 'Специальности', icon: BookOpen },
    { id: 'benefits', label: 'Льготы', icon: Award },
    { id: 'documents', label: 'Документы', icon: FileText },
  ];

  const handleSectionChange = (id: Section) => {
    setActiveSection(id);
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-40 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`hidden md:flex flex-col bg-white shadow-md transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-16'}
        `}
      >
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-300 overflow-hidden">
          <Shield className="text-blue-600 shrink-0" size={24} />
          {isExpanded && (
            <span className="font-semibold text-lg whitespace-nowrap">Админ панель</span>
          )}
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                ${activeSection === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}
                ${!isExpanded ? 'justify-center' : ''}
              `}
            >
              <item.icon size={18} className="shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-gray-300">
          <Link
            to="/Dashboard"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition
              ${!isExpanded ? 'justify-center' : ''}
            `}
          >
            <LogOut size={18} className="shrink-0" />
            {isExpanded && <span className="whitespace-nowrap">Выйти</span>}
          </Link>
        </div>
      </aside>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md flex flex-col z-30 transition-transform duration-300 ease-in-out md:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-300">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            <span className="font-semibold text-lg">Админ панель</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id as Section)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                ${activeSection === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-300">
          <Link
            to="/Dashboard"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-600/10 hover:text-white transition"
          >
            <LogOut size={18} />
            Выйти
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white shadow-sm">
          <button onClick={() => setIsMobileOpen(true)}>
            <Menu size={22} className="text-gray-700" />
          </button>
          <span className="font-semibold">Админ панель</span>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'specialities' && <SpecialitiesSection />}
          {activeSection === 'benefits' && <BenefitsSection />}
          {activeSection === 'documents' && <DocumentsSection />}
        </main>
      </div>
    </div>
  );
};

const UsersSection = () => (
  <div>
    <UsersSectionPage />
  </div>
);

const SpecialitiesSection = () => (
  <div>
    <SpecialitiesSectionPage />
  </div>
);

const BenefitsSection = () => (
  <div>
    <BenefitsSectionPage />
  </div>
);

const DocumentsSection = () => (
  <div>
    <DocumentsSectionPage />
  </div>
);