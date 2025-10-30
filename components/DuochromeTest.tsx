import React, { useState } from 'react';
import { RotateCcw, CheckCircle, BrainCircuit, Scale, Download } from 'lucide-react';
import { DuochromeTestService, DuochromeUserInput } from '../services/duochromeService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { DuochromeResult, AIReport } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePdfExport } from '../hooks/usePdfExport';

const duochromeService = new DuochromeTestService();
const aiService = new AIService();
const storageService = new StorageService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-yellow-500 rounded-full animate-spin"></div>
                <BrainCircuit className="text-yellow-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('loading_title')}</h2>
            <p className="text-gray-600">{t('loading_subtitle')}</p>
        </div>
    );
};

const ReportDisplay: React.FC<{ result: DuochromeResult; report: AIReport }> = ({ result, report }) => {
    const { t } = useLanguage();
    const { reportRef, exportToPdf, isExporting } = usePdfExport();
    const resultTextMap = {
      myopic: t('duochrome_myopic'),
      hyperopic: t('duochrome_hyperopic'),
      normal: t('duochrome_normal'),
    };
    const resultColorMap = {
      myopic: 'text-red-700 bg-red-50',
      hyperopic: 'text-green-700 bg-green-50',
      normal: 'text-blue-700 bg-blue-50',
    };

    return (
        <div className="w-full">
            <div ref={reportRef} className="bg-white max-w-4xl mx-auto p-4 sm:p-8 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('report_title_duochrome')}</h2>
                
                <div className={`text-center rounded-xl p-6 mb-6 ${resultColorMap[result.result]}`}>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('test_result')}</h3>
                    <p className="text-3xl font-bold">{resultTextMap[result.result]}</p>
                    <p className="text-sm text-gray-600 mt-2">{result.details}</p>
                </div>

                <div className="space-y-6">
                    <div><h4 className="font-bold text-lg mb-2 flex items-center"><Scale className="mr-2 text-blue-500"/>{t('general_assessment')}</h4><p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">{report.summary}</p></div>
                    <div>
                        <h4 className="font-bold text-lg mb-2 flex items-center"><CheckCircle className="mr-2 text-green-500"/>{t('recommendations')}</h4>
                        <ul className="space-y-2 list-inside text-gray-700 bg-green-50 p-4 rounded-lg">
                            {report.recommendations.map((rec, i) => <li key={i} className="flex"><span className="text-green-600 mr-2 font-bold">✓</span>{rec}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"><RotateCcw size={18}/>{t('redo_test')}</button>
                <button 
                    onClick={() => exportToPdf(`duochrome-report-${result.date.split('T')[0]}`)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download size={18}/>
                    {isExporting ? t('exporting_pdf') : t('export_pdf')}
                </button>
            </div>
        </div>
    );
};

const DuochromeChart: React.FC = () => (
    <div className="flex w-full max-w-lg h-48 rounded-lg overflow-hidden shadow-lg">
        <div className="w-1/2 bg-red-600 flex items-center justify-center">
            <span className="text-6xl font-sans font-bold text-black">E</span>
        </div>
        <div className="w-1/2 bg-green-600 flex items-center justify-center">
             <span className="text-6xl font-sans font-bold text-black">E</span>
        </div>
    </div>
);

const TestScreen: React.FC<{ handleSelection: (selection: DuochromeUserInput) => void; }> = ({ handleSelection }) => {
  const { t } = useLanguage();

  const options = [
      { labelKey: 'duochrome_option_red', value: 'red', color: 'bg-red-500 hover:bg-red-600' },
      { labelKey: 'duochrome_option_green', value: 'green', color: 'bg-green-500 hover:bg-green-600' },
      { labelKey: 'duochrome_option_equal', value: 'equal', color: 'bg-gray-500 hover:bg-gray-600' }
  ];
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        <div className="mb-8"><DuochromeChart /></div>
      <p className="text-lg text-gray-700 mb-6 text-center">{t('duochrome_question')}</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {options.map(opt => (
             <button key={opt.value} onClick={() => handleSelection(opt.value as DuochromeUserInput)} className={`flex-1 text-white p-4 rounded-lg font-semibold transition-colors ${opt.color}`}>
                {t(opt.labelKey as any)}
             </button>
        ))}
      </div>
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('duochrome_start_title')}</h1>
            <p className="text-lg text-gray-600 mb-8">{t('duochrome_start_desc')}</p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('duochrome_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('duochrome_instruction_1')}</li>
                <li>{t('duochrome_instruction_2')}</li>
                <li>{t('duochrome_instruction_3')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const DuochromeTest: React.FC = () => {
  const { t } = useLanguage();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [result, setResult] = useState<DuochromeResult | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);

  const startTest = () => {
    duochromeService.startTest();
    setTestState('testing');
  };

  const handleSelection = async (selection: DuochromeUserInput) => {
    setTestState('loading');
    const testResult = duochromeService.calculateResult(selection);
    setResult(testResult);
    try {
      const aiReport = await aiService.generateReport('duochrome', testResult);
      setReport(aiReport);
      storageService.saveTestResult(testResult, aiReport);
    } catch (err) {
      console.error(err);
    }
    setTestState('report');
  };

  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        return <TestScreen handleSelection={handleSelection} />;
      case 'loading':
        return <Loader />;
      case 'report':
        if (result && report) return <ReportDisplay result={result} report={report} />;
        return <div className="text-center text-red-500">{t('error_report')}</div>
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
      {renderContent()}
    </div>
  );
};