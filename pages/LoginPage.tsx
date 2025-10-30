import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Cake, Phone } from 'lucide-react';
import { UserProfile } from '../types';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const { t } = useLanguage();
    const [profile, setProfile] = useState<UserProfile>({ name: '', age: '', phone: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!profile.name.trim() || !profile.age.trim()) {
            setError(t('login_error_required'));
            return;
        }
        const ageNum = Number(profile.age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            setError(t('login_error_age'));
            return;
        }
        login(profile);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in-up">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">{t('login_title')}</h2>
                    <p className="mt-2 text-gray-600">{t('login_subtitle')}</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            placeholder={t('login_name_placeholder')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div className="relative">
                        <Cake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            name="age"
                            value={profile.age}
                            onChange={handleChange}
                            placeholder={t('login_age_placeholder')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            placeholder={t('login_phone_placeholder')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg">
                            {t('login_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
