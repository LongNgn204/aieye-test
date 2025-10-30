import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Droplets, Target, Grid, CircleDot, History } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { HealthDashboard } from '../components/HealthDashboard';

const TestCard: React.FC<{test: any}> = ({ test }) => {
    const { t } = useLanguage();
    return (
        <Link to={test.path}>
            <div className={`relative flex flex-col items-center justify-center p-6 rounded-xl h-48 transition-all duration-300 transform ${test.bgColor} hover:shadow-lg hover:-translate-y-2`}>
                <div className={`mb-4 p-3 rounded-full ${test.bgColor}`}>
                    <test.icon className={test.color} size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{t(test.nameKey)}</h3>
                <p className="text-sm text-gray-500 text-center">{t(test.descKey)}</p>
            </div>
        </Link>
    );
};

export const Home: React.FC = () => {
  const { t } = useLanguage();
  
  const tests = [
    { nameKey: 'snellen_test', descKey: 'snellen_desc', path: '/test/snellen', icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { nameKey: 'colorblind_test', descKey: 'colorblind_desc', path: '/test/colorblind', icon: Droplets, color: 'text-green-500', bgColor: 'bg-green-50' },
    { nameKey: 'astigmatism_test', descKey: 'astigmatism_desc', path: '/test/astigmatism', icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { nameKey: 'amsler_grid_test', descKey: 'amsler_grid_desc', path: '/test/amsler', icon: Grid, color: 'text-red-500', bgColor: 'bg-red-50' },
    { nameKey: 'duochrome_test', descKey: 'duochrome_desc', path: '/test/duochrome', icon: CircleDot, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { nameKey: 'history_page', descKey: 'history_desc', path: '/history', icon: History, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  ];

  return (
    <main className="max-w-5xl mx-auto p-6 lg:p-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">{t('home_title')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('home_subtitle')}</p>
      </div>

      <HealthDashboard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tests.map(test => <TestCard key={test.nameKey} test={test} />)}
      </div>
    </main>
  );
};