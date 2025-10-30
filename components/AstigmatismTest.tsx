import React, { useState, useMemo } from 'react';
import { RotateCcw, CheckCircle, BrainCircuit, Check, Zap, Mic } from 'lucide-react';
import { AstigmatismTestService, AstigmatismUserInput } from '../services/astigmatismService';
import { ConsensusService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { AstigmatismResult, AIReport } from '../types';
import { AstigmatismWheel } from './AstigmatismWheel';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useVoiceControlContext } from '../context/VoiceControlContext';

const astigmatismService = new AstigmatismTestService();
const aiService = new ConsensusService();
const storageService = new StorageService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-purple-600 rounded-full animate-spin"></div>
                <BrainCircuit className="text-purple-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('loading_title')}</h2>
            <p className="text-gray-600">{t('loading_subtitle')}</p>
        </div>
    );
};

const ReportDisplay: React.FC<{ result: AstigmatismResult; report: AIReport }> = ({ result, report }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white max-w-4xl mx-auto p-4 sm:p-8 rounded-2xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('report_title_astigmatism')}</h2>
            
            <div className={`text-center rounded-xl p-6 mb-6 ${result.hasAstigmatism ? 'bg-purple-50' : 'bg-green-50'}`}>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('test_result')}</h3>
                <p className={`text-3xl font-bold ${result.hasAstigmatism ? 'text-purple-700' : 'text-green-700'}`}>
                    {result.hasAstigmatism ? t('astigmatism_detected') : t('astigmatism_not_detected')}
                </p>
                <p className="text-sm text-gray-600 mt-2">{result.details}</p>
            </div>

            <div className="space-y-6">
                <div><h4 className="font-bold text-lg mb-2 flex items-center"><Zap className="mr-2 text-blue-500"/>{t('ai_assessment')}</h4><p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">{report.summary}</p></div>
                <div>
                    <h4 className="font-bold text-lg mb-2 flex items-center"><CheckCircle className="mr-2 text-green-500"/>{t('recommendations')}</h4>
                    <ul className="space-y-2 list-inside text-gray-700 bg-green-50 p-4 rounded-lg">
                        {report.recommendations.map((rec, i) => <li key={i} className="flex"><span className="text-green-600 mr-2 font-bold">✓</span>{rec}</li>)}
                    </ul>
                </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"><RotateCcw size={18}/>{t('redo_test')}</button>
            </div>
        </div>
    );
};

const TestScreen: React.FC<{ handleSelection: (selection: AstigmatismUserInput) => void; }> = ({ handleSelection }) => {
  const { t, language } = useLanguage();
  const { isVoiceControlEnabled } = useVoiceControlContext();

  const commands = useMemo(() => language === 'vi'
    ? [
        { keywords: ['nét', 'bình thường', 'tất cả'], callback: () => handleSelection('none') },
        { keywords: ['dọc', 'đứng'], callback: () => handleSelection('vertical') },
        { keywords: ['ngang'], callback: () => handleSelection('horizontal') },
        { keywords: ['chéo'], callback: () => handleSelection('oblique') }
      ]
    : [
        { keywords: ['sharp', 'normal', 'all'], callback: () => handleSelection('none') },
        { keywords: ['vertical'], callback: () => handleSelection('vertical') },
        { keywords: ['horizontal'], callback: () => handleSelection('horizontal') },
        { keywords: ['diagonal', 'oblique'], callback: () => handleSelection('oblique') }
      ],
  [language, handleSelection]);

  const { isListening } = useVoiceControl({ commands });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="mb-6"><AstigmatismWheel /></div>
      <p className="text-lg text-gray-700 mb-6 text-center">{t('astigmatism_question')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button onClick={() => handleSelection('none')} className="flex items-center justify-center gap-2 bg-green-100 text-green-800 border-2 border-green-200 rounded-lg p-4 h-20 hover:border-green-600 transition-all font-semibold"><Check size={24}/>{t('astigmatism_option_all_sharp')}</button>
        <button onClick={() => handleSelection('vertical')} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-purple-600 hover:bg-purple-50 transition-all"><span className="font-bold text-lg">|</span>{t('astigmatism_option_vertical')}</button>
        <button onClick={() => handleSelection('horizontal')} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-purple-600 hover:bg-purple-50 transition-all"><span className="font-bold text-lg">─</span>{t('astigmatism_option_horizontal')}</button>
        <button onClick={() => handleSelection('oblique')} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-purple-600 hover:bg-purple-50 transition-all"><span className="font-bold text-lg">/</span>{t('astigmatism_option_oblique')}</button>
      </div>
      {isVoiceControlEnabled && (
         <div className="mt-6 flex items-center justify-center gap-2 text-lg text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
            <Mic size={20} className={isListening ? 'animate-pulse' : ''}/>
            <span>{t('voice_listening_auto')}</span>
         </div>
      )}
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('astigmatism_start_title')}</h1>
            <p className="text-lg text-gray-600 mb-8">{t('astigmatism_start_desc')}</p>
            <div className="bg-purple-50 border-l-4 border-purple-500 text-purple-800 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('astigmatism_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('astigmatism_instruction_1')}</li>
                <li>{t('astigmatism_instruction_2')}</li>
                <li>{t('astigmatism_instruction_3')}</li>
                <li>{t('astigmatism_instruction_4')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const AstigmatismTest: React.FC = () => {
  const { t } = useLanguage();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [result, setResult] = useState<AstigmatismResult | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);

  const startTest = () => {
    astigmatismService.startTest();
    setTestState('testing');
  };

  const handleSelection = async (selection: AstigmatismUserInput) => {
    setTestState('loading');
    const testResult = astigmatismService.calculateResult(selection);
    setResult(testResult);
    try {
      const aiReport = await aiService.generateReport('astigmatism', testResult);
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