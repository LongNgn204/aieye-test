import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storageService';
import { StoredTestResult } from '../types';

const storageService = new StorageService();

export const HealthDashboard: React.FC = () => {
    const { t } = useLanguage();
    const [recentHighSeverityTests, setRecentHighSeverityTests] = useState<StoredTestResult[]>([]);
    const [weeklyTestCount, setWeeklyTestCount] = useState(0);

    useEffect(() => {
        const history = storageService.getTestHistory();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentTests = history.filter(test => new Date(test.date) > oneWeekAgo);
        
        setWeeklyTestCount(recentTests.length);
        
        const highSeverity = recentTests.filter(test => test.report.severity === 'HIGH');
        setRecentHighSeverityTests(highSeverity);

    }, []);

    const hasAlert = recentHighSeverityTests.length > 0;

    return (
        <div className="mb-12 p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('health_dashboard_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Alert */}
                <div className={`p-4 rounded-lg flex items-start gap-4 ${hasAlert ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border`}>
                    {hasAlert ? (
                        <AlertTriangle className="text-red-500 h-8 w-8 mt-1 flex-shrink-0" />
                    ) : (
                        <ShieldCheck className="text-green-500 h-8 w-8 mt-1 flex-shrink-0" />
                    )}
                    <div>
                        <h3 className={`font-bold ${hasAlert ? 'text-red-700' : 'text-green-700'}`}>
                            {hasAlert ? t('health_alert_title') : t('all_clear_title')}
                        </h3>
                        <p className={`text-sm ${hasAlert ? 'text-red-600' : 'text-green-600'}`}>
                            {hasAlert ? t('health_alert_desc') : t('all_clear_desc')}
                        </p>
                    </div>
                </div>

                {/* Weekly Overview */}
                <div className="p-4 rounded-lg flex items-start gap-4 bg-blue-50 border border-blue-200">
                    <Activity className="text-blue-500 h-8 w-8 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-700">{t('weekly_overview_title')}</h3>
                        <p className="text-sm text-blue-600">
                            {weeklyTestCount === 0 && t('weekly_overview_desc_zero')}
                            {weeklyTestCount === 1 && t('weekly_overview_desc_one')}
                            {weeklyTestCount > 1 && t('weekly_overview_desc_other').replace('{count}', weeklyTestCount.toString())}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
