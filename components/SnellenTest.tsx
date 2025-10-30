import React, { useState } from 'react';
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, RotateCcw, Download, CheckCircle, AlertTriangle, Activity, BrainCircuit } from 'lucide-react';
import { SnellenTestService } from '../services/snellenService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { SnellenResult, AIReport } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePdfExport } from '../hooks/usePdfExport';

const snellenService = new SnellenTestService();
const aiService = new AIService();
const storageService = new StorageService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-blue-600 rounded-full animate-spin"></div>
                <BrainCircuit className="text-blue-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('loading_title')}</h2>
            <p className="text-gray-600">{t('loading_subtitle')}</p>
        </div>
    );
};

const ReportDisplay: React.FC<{ result: SnellenResult; report: AIReport }> = ({ result, report }) => {
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('report_title_snellen')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('test_result')}</h3>
                        <p className="text-5xl font-bold text-blue-600">{result.score}</p>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div><p className="font-bold text-lg">{result.correctAnswers}/{result.totalQuestions}</p><p className="text-xs text-gray-500">{t('correct')}</p></div>
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
                    {report.causes && <div><h4 className="font-bold text-lg mb-2 flex items-center"><AlertTriangle className="mr-2 text-yellow-500"/>{t('potential_causes')}</h4><p className="text-gray-700 leading-relaxed bg-yellow-50 p-4 rounded-lg">{report.causes}</p></div>}
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
                    onClick={() => exportToPdf(`snellen-report-${result.date.split('T')[0]}`)}
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

const TestScreen: React.FC<{ questions: any[]; currentQuestion: number; handleAnswer: (rotation: number) => void; }> = ({ questions, currentQuestion, handleAnswer }) => {
  const { t } = useLanguage();

  const directionButtons = [
      { Icon: ArrowUp, labelKey: 'direction_up', rotation: 0 },
      { Icon: ArrowRight, labelKey: 'direction_right', rotation: 90 },
      { Icon: ArrowDown, labelKey: 'direction_down', rotation: 180 },
      { Icon: ArrowLeft, labelKey: 'direction_left', rotation: 270 }
  ];
  const question = questions[currentQuestion];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="w-full mb-8 text-center">
        <p className="text-sm text-gray-600 mb-2">{t('question')} {currentQuestion + 1} / {questions.length}</p>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}/>
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-48 mb-12">
        <div className="text-9xl font-bold text-gray-800 transition-all duration-300" style={{ fontSize: `${question.size}px`, transform: `rotate(${question.rotation}deg)` }}>E</div>
      </div>
      <p className="text-lg text-gray-700 mb-6">{t('snellen_question')}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {directionButtons.map(({ Icon, labelKey, rotation }) => (
          <button key={rotation} onClick={() => handleAnswer(rotation)} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105">
            <Icon size={24} /><span className="font-semibold">{t(labelKey as any)}</span>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('snellen_start_title')}</h1>
            <p className="text-lg text-gray-600 mb-8">{t('snellen_start_desc')}</p>
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('snellen_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('snellen_instruction_1')}</li>
                <li>{t('snellen_instruction_2')}</li>
                <li>{t('snellen_instruction_3')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">{t('start_test')}</button>
        </div>
    );
};

export const SnellenTest: React.FC = () => {
  const { t } = useLanguage();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<SnellenResult | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTest = () => {
    setQuestions(snellenService.startTest());
    setCurrentQuestion(0);
    setTestState('testing');
  };

  const handleAnswer = async (rotation: number) => {
    snellenService.submitAnswer(currentQuestion, rotation);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setTestState('loading');
      const testResult = snellenService.calculateResult();
      setResult(testResult);
      try {
        const aiReport = await aiService.generateReport('snellen', testResult);
        setReport(aiReport);
        storageService.saveTestResult(testResult, aiReport);
        setTestState('report');
      } catch (err) {
        setError(t('error_report'));
        console.error(err);
        setTestState('report'); 
      }
    }
  };

  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        return <TestScreen questions={questions} currentQuestion={currentQuestion} handleAnswer={handleAnswer} />;
      case 'loading':
        return <Loader />;
      case 'report':
        if (result && report) return <ReportDisplay result={result} report={report} />;
        if (result && !report) return <div className="text-center text-red-500">{error}<br/><button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">{t('try_again')}</button></div>
        return <div className="text-center text-red-500">An unexpected error occurred.</div>
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
      {renderContent()}
    </div>
  );
};