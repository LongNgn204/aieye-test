import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, CheckCircle, Activity, BrainCircuit, Download, TrendingUp } from 'lucide-react';
import { ColorBlindTestService, Plate } from '../services/colorBlindService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { ColorBlindResult, AIReport } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { useUser } from '../context/UserContext';

const colorBlindService = new ColorBlindTestService();
const aiService = new AIService();
const storageService = new StorageService();

const MockPlate: React.FC<{text: string}> = ({text}) => (
    <div className="w-64 h-64 rounded-full flex items-center justify-center bg-gray-200 relative overflow-hidden">
        <span className="text-5xl font-bold text-gray-600 z-10">{text === 'nothing' ? '' : text}</span>
        {Array.from({length: 200}).map((_, i) => {
            const size = Math.random() * 20 + 5;
            const colors = ['bg-green-300', 'bg-red-300', 'bg-yellow-300', 'bg-blue-300'];
            return (
                <div
                    key={i}
                    className={`absolute rounded-full ${colors[i % 4]}`}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: 0.5,
                    }}
                />
            )
        })}
    </div>
);

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-green-600 rounded-full animate-spin"></div>
                <BrainCircuit className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('loading_title')}</h2>
            <p className="text-gray-600">{t('loading_subtitle')}</p>
        </div>
    );
};

const ReportDisplay: React.FC<{ result: ColorBlindResult; report: AIReport }> = ({ result, report }) => {
    const { t } = useLanguage();
    const { reportRef, exportToPdf, isExporting } = usePdfExport();
    const severityStyles = {
        NONE: 'bg-gray-100 text-gray-800',
        LOW: 'bg-green-100 text-green-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-red-100 text-red-800',
    };
    return (
        <div className="w-full">
            <div ref={reportRef} className="bg-white max-w-4xl mx-auto p-4 sm:p-8 rounded-2xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('report_title_colorblind')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('test_result')}</h3>
                        <p className="text-3xl font-bold text-green-600">{result.type}</p>
                         <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div><p className="font-bold text-lg">{result.correct}/{result.total}</p><p className="text-xs text-gray-500">{t('correct')}</p></div>
                            <div><p className="font-bold text-lg">{result.accuracy}%</p><p className="text-xs text-gray-500">{t('accuracy')}</p></div>
                            <div><p className="font-bold text-lg">{result.duration}s</p><p className="text-xs text-gray-500">{t('duration')}</p></div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                         <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('ai_confidence')}</h3>
                        <p className={`text-5xl font-bold ${report.confidence >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>{report.confidence}%</p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <div className={`px-3 py-1 text-xs font-semibold rounded-full ${severityStyles[report.severity]}`}>{t('severity')}: {report.severity}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div><h4 className="font-bold text-lg mb-2 flex items-center"><Activity className="mr-2 text-blue-500"/>{t('general_assessment')}</h4><p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">{report.summary}</p></div>
                     {report.trend && (
                        <div><h4 className="font-bold text-lg mb-2 flex items-center"><TrendingUp className="mr-2 text-indigo-500"/>{t('trend_analysis')}</h4><p className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg">{report.trend}</p></div>
                    )}
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
                    onClick={() => exportToPdf(`colorblind-report-${result.date.split('T')[0]}`)}
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

const TestScreen: React.FC<{ plates: Plate[]; currentPlate: number; handleSubmit: (answer: string) => void; }> = ({ plates, currentPlate, handleSubmit }) => {
  const { t } = useLanguage();
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPlate]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(answer);
    setAnswer('');
  };

  const handleNothingClick = () => {
      handleSubmit('nothing');
      setAnswer('');
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="w-full mb-4 text-center">
        <p className="text-sm text-gray-600 mb-2">{t('plate')} {currentPlate + 1} / {plates.length}</p>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 rounded-full transition-all duration-300" style={{ width: `${((currentPlate + 1) / plates.length) * 100}%` }}/>
        </div>
      </div>
       <div className="mb-6"><MockPlate text={plates[currentPlate].correctAnswer} /></div>
      <p className="text-lg text-gray-700 mb-4">{t('colorblind_question')}</p>
      <form onSubmit={onFormSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="flex gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.trim())}
              className="text-center text-2xl font-bold w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
              placeholder={t('input_placeholder')}
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">{t('submit')}</button>
          </div>
          <button type="button" onClick={handleNothingClick} className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">{t('nothing_button')}</button>
      </form>
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('colorblind_start_title')}</h1>
            <p className="text-lg text-gray-600 mb-8">{t('colorblind_start_desc')}</p>
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('colorblind_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('colorblind_instruction_1')}</li>
                <li>{t('colorblind_instruction_2')}</li>
                <li>{t('colorblind_instruction_3')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const ColorBlindTest: React.FC = () => {
  const { t, language } = useLanguage();
  const { userProfile } = useUser();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [plates, setPlates] = useState<Plate[]>([]);
  const [currentPlate, setCurrentPlate] = useState(0);
  const [result, setResult] = useState<ColorBlindResult | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);

  const startTest = () => {
    setPlates(colorBlindService.startTest());
    setCurrentPlate(0);
    setTestState('testing');
  };

  const handleSubmit = async (answer: string) => {
    colorBlindService.submitAnswer(plates[currentPlate].id, answer);
    if (currentPlate < plates.length - 1) {
      setCurrentPlate(currentPlate + 1);
    } else {
      setTestState('loading');
      const testResult = colorBlindService.calculateResult();
      setResult(testResult);
      try {
        const history = storageService.getTestHistory();
        const aiReport = await aiService.generateReport('colorblind', testResult, userProfile, history, language);
        setReport(aiReport);
        storageService.saveTestResult(testResult, aiReport);
      } catch (err) {
        console.error(err);
      }
      setTestState('report');
    }
  };

  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        return <TestScreen plates={plates} currentPlate={currentPlate} handleSubmit={handleSubmit} />;
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