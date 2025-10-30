import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { UserInfo } from './UserInfo';
import { VoiceToggle } from './VoiceToggle';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { to: "/", icon: Home, label: t('nav_home') },
    { to: "/history", icon: History, label: t('nav_history') },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r flex flex-col transition-all duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isOpen ? 'w-64' : 'lg:w-20 w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b h-20">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity ${isOpen ? 'opacity-100' : 'lg:opacity-0'}`}>
            <Eye className="text-blue-600 flex-shrink-0" size={32} />
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">{t('appName')}</span>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `relative group flex items-center gap-4 p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              } ${isOpen ? '' : 'justify-center'}`
            }
          >
            <item.icon size={24} className="flex-shrink-0"/>
            <span className={`font-medium whitespace-nowrap transition-opacity ${isOpen ? 'opacity-100' : 'lg:opacity-0'}`}>{item.label}</span>
            {!isOpen && (
                <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-50">
                    {item.label}
                </span>
            )}
          </NavLink>
        ))}
        <div className="pt-2">
          <VoiceToggle isOpen={isOpen} />
        </div>
      </nav>

      <div className="p-4 border-t">
         <div className={`flex justify-center mb-4 ${isOpen ? 'gap-2' : 'flex-col gap-2'}`}>
            <button 
                onClick={() => setLanguage('vi')}
                className={`w-full py-2 rounded font-semibold text-sm transition-colors ${language === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
                {isOpen ? 'Tiếng Việt' : 'VI'}
            </button>
            <button 
                onClick={() => setLanguage('en')}
                className={`w-full py-2 rounded font-semibold text-sm transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
                {isOpen ? 'English' : 'EN'}
            </button>
        </div>
        <UserInfo isOpen={isOpen}/>
      </div>
       <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="absolute -right-3 top-24 w-6 h-6 bg-white border-2 border-blue-600 text-blue-600 rounded-full items-center justify-center hover:bg-blue-50 hidden lg:flex"
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
};