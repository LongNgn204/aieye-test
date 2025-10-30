import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { User, Clock } from 'lucide-react';

interface UserInfoProps {
    isOpen: boolean;
}

export const UserInfo: React.FC<UserInfoProps> = ({ isOpen }) => {
    const { language, t } = useLanguage();
    const { userProfile } = useUser();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const userName = userProfile?.name || t('user');
    
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    return (
        <div className="text-xs text-gray-500">
            {isOpen ? (
                <>
                    <div className="flex items-center gap-2 mb-1 truncate">
                        <User size={16} />
                        <span title={userName}>{userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <div>
                            <div>{currentTime.toLocaleTimeString(locale, timeOptions)}</div>
                            <div>{currentTime.toLocaleDateString(locale, dateOptions)}</div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                    {/* FIX: The 'title' prop is not valid for lucide-react icons. To add a tooltip, wrap the icon in an element that has a 'title' attribute. */}
                    <div title={userName}>
                      <User size={20} />
                    </div>
                    <div className="font-semibold">{currentTime.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})}</div>
                </div>
            )}
        </div>
    );
};