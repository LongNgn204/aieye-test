import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Droplets, Target, Grid, CircleDot, Bot, X } from 'lucide-react';

export const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const { markAsVisited } = useUser();
    const { t } = useLanguage();
    const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

    const handleProceed = () => {
        markAsVisited();
        navigate('/login');
    };

    const features = [
        { icon: Eye, nameKey: 'snellen_test', popupTitleKey: 'snellen_popup_title', popupDescKey: 'snellen_popup_desc' },
        { icon: Droplets, nameKey: 'colorblind_test', popupTitleKey: 'colorblind_popup_title', popupDescKey: 'colorblind_popup_desc' },
        { icon: Target, nameKey: 'astigmatism_test', popupTitleKey: 'astigmatism_popup_title', popupDescKey: 'astigmatism_popup_desc' },
        { icon: Grid, nameKey: 'amsler_grid_test', popupTitleKey: 'amsler_popup_title', popupDescKey: 'amsler_popup_desc' },
        { icon: CircleDot, nameKey: 'duochrome_test', popupTitleKey: 'duochrome_popup_title', popupDescKey: 'duochrome_popup_desc' },
        { icon: Bot, nameKey: 'chatbot_title', popupTitleKey: 'chatbot_popup_title', popupDescKey: 'chatbot_popup_desc' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 flex flex-col items-center justify-center p-4 text-center">
            <style>{`
                .animation-delay-500 { animation-delay: 500ms; }
                .animate-fade-in-down { animation: fadeInDown 0.8s ease-out both; }
                .animate-fade-in-up { animation: fadeInUp 0.8s ease-out both; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
                .animate-modal-in { animation: fadeInUp 0.3s ease-out both; }
                @keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
            `}</style>
            <div className="max-w-4xl w-full">
                <header className="mb-12 animate-fade-in-down">
                    <Eye size={64} className="text-blue-600 mx-auto mb-4" />
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800">{t('welcome_title')}</h1>
                    <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">{t('welcome_subtitle')}</p>
                </header>
                
                <main className="mb-12 animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-gray-700 mb-8">{t('features_title')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <button 
                                key={index} 
                                onClick={() => setSelectedFeature(feature)}
                                className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 transition-transform hover:scale-105 text-left"
                            >
                                <feature.icon size={40} className="text-blue-500" />
                                <span className="font-semibold text-gray-700 text-center">{t(feature.nameKey as any)}</span>
                            </button>
                        ))}
                    </div>
                </main>

                <footer className="animate-fade-in-up animation-delay-500">
                    <button 
                        onClick={handleProceed}
                        className="bg-blue-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        {t('get_started')}
                    </button>
                    <p className="mt-8 text-sm text-gray-500">
                        {t('welcome_copyright')}
                    </p>
                </footer>
            </div>
            
            {selectedFeature && (
                <div 
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedFeature(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative animate-modal-in"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <button 
                            onClick={() => setSelectedFeature(null)} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                            <selectedFeature.icon size={40} className="text-blue-500 flex-shrink-0" />
                            <h3 className="text-2xl font-bold text-gray-800 text-center sm:text-left">{t(selectedFeature.popupTitleKey)}</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-center sm:text-left">
                            {t(selectedFeature.popupDescKey)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};