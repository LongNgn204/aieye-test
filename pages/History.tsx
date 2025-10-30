import React, { useState, useEffect } from 'react';
import { Eye, Droplets, Target, Grid, CircleDot, Trash2, Calendar, FileText } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { StoredTestResult, TestType, SnellenResult, ColorBlindResult, AstigmatismResult, AmslerGridResult, DuochromeResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

const storageService = new StorageService();

const ICONS: Record<TestType, React.ElementType> = {
  snellen: Eye,
  colorblind: Droplets,
  astigmatism: Target,
  amsler: Grid,
  duochrome: CircleDot,
};

const ResultSummary: React.FC<{ result: StoredTestResult }> = ({ result }) => {
    const { t } = useLanguage();
    const data = result.resultData;
    switch(result.testType) {
        case 'snellen':
            return <p className="text-2xl font-bold text-blue-600">{(data as SnellenResult).score}</p>
        case 'colorblind':
            return <p className="text-2xl font-bold text-green-600">{(data as ColorBlindResult).accuracy}%</p>
        case 'astigmatism':
            const astigData = data as AstigmatismResult;
            return <p className={`text-xl font-bold ${astigData.hasAstigmatism ? 'text-purple-600' : 'text-gray-700'}`}>{astigData.hasAstigmatism ? t('astigmatism_detected_short') : t('astigmatism_normal_short')}</p>
        case 'amsler':
            const amslerData = data as AmslerGridResult;
            return <p className={`text-xl font-bold ${amslerData.issueDetected ? 'text-red-600' : 'text-gray-700'}`}>{amslerData.issueDetected ? t('amsler_issue_short') : t('astigmatism_normal_short')}</p>
        case 'duochrome':
            const duochromeData = data as DuochromeResult;
            const textMap = { normal: t('astigmatism_normal_short'), myopic: t('duochrome_myopic_short'), hyperopic: t('duochrome_hyperopic_short')};
            return <p className={`text-xl font-bold text-yellow-700`}>{textMap[duochromeData.result]}</p>
        default:
            return null;
    }
}

export const History: React.FC = () => {
  const [history, setHistory] = useState<StoredTestResult[]>([]);
  const { t, language } = useLanguage();

  const TITLES: Record<TestType, string> = {
    snellen: t('snellen_test'),
    colorblind: t('colorblind_test'),
    astigmatism: t('astigmatism_test'),
    amsler: t('amsler_grid_test'),
    duochrome: t('duochrome_test'),
  };

  useEffect(() => {
    setHistory(storageService.getTestHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm(t('confirm_clear_history'))) {
      storageService.clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">{t('history_title')}</h1>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            <Trash2 size={18} />
            {t('clear_all')}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-gray-100 rounded-xl">
            <FileText size={48} className="mx-auto text-gray-400 mb-4"/>
            <h2 className="text-xl font-semibold text-gray-700">{t('history_empty_title')}</h2>
            <p className="text-gray-500">{t('history_empty_desc')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => {
            const Icon = ICONS[item.testType];
            return (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Icon className="text-gray-500" size={32} />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{TITLES[item.testType]}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar size={14} className="mr-2" />
                                {new Date(item.date).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                            </div>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                       <ResultSummary result={item} />
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-600"><span className="font-semibold">{t('ai_assessment')}:</span> {item.report.summary}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};