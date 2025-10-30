import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Cpu, ShieldAlert } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center">{t('about_title')}</h1>

      <div className="space-y-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Heart className="text-blue-500 mr-3" size={28} />
            {t('about_purpose_title')}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t('about_purpose_content')}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Cpu className="text-purple-500 mr-3" size={28} />
            {t('about_tech_title')}
          </h2>
          <p className="text-gray-600 leading-relaxed font-mono bg-gray-100 p-4 rounded-lg">
            {t('about_tech_list')}
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-8 rounded-r-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
            <ShieldAlert className="text-red-500 mr-3" size={28} />
            {t('about_disclaimer_title')}
          </h2>
          <p className="text-red-600 leading-relaxed font-semibold">
            {t('about_disclaimer_content')}
          </p>
        </div>
      </div>
    </div>
  );
};