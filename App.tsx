import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { SnellenTest } from './components/SnellenTest';
import { ColorBlindTest } from './components/ColorBlindTest';
import { AstigmatismTest } from './components/AstigmatismTest';
import { AmslerGridTest } from './components/AmslerGridTest';
import { DuochromeTest } from './components/DuochromeTest';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VoiceControlProvider } from './context/VoiceControlContext';
import { UserProvider, useUser } from './context/UserContext';
import { Sidebar } from './components/Sidebar';
import { Chatbot } from './components/Chatbot';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { Menu, X } from 'lucide-react';

const MainAppLayout: React.FC = () => {
    const { t } = useLanguage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const location = useLocation();

    useEffect(() => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }, [location]);

    // Close sidebar on navigation on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans relative">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    aria-hidden="true"
                ></div>
            )}
            
            <div className={`flex-grow flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 flex items-center justify-between lg:justify-end p-4 h-20">
                    <button className="text-gray-700 lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle menu">
                        {isSidebarOpen ? <X size={28}/> : <Menu size={28}/>}
                    </button>
                    <div className="hidden lg:block"></div>
                </header>

                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/test/snellen" element={<SnellenTest />} />
                        <Route path="/test/colorblind" element={<ColorBlindTest />} />
                        <Route path="/test/astigmatism" element={<AstigmatismTest />} />
                        <Route path="/test/amsler" element={<AmslerGridTest />} />
                        <Route path="/test/duochrome" element={<DuochromeTest />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                
                <footer className="bg-white border-t mt-auto">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                        <p>{t('footer_copyright')}</p>
                        <p className="text-xs mt-2">{t('footer_disclaimer')}</p>
                    </div>
                </footer>
            </div>
            <Chatbot />
        </div>
    );
}

const AppRouter: React.FC = () => {
    const { userProfile, hasVisited } = useUser();

    return (
        <Routes>
            {!hasVisited && <Route path="*" element={<WelcomePage />} />}
            {hasVisited && !userProfile && <Route path="*" element={<LoginPage />} />}
            {hasVisited && userProfile && <Route path="/*" element={<MainAppLayout />} />}
        </Routes>
    );
};

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <VoiceControlProvider>
          <HashRouter>
              <AppRouter />
          </HashRouter>
        </VoiceControlProvider>
      </UserProvider>
    </LanguageProvider>
  );
}