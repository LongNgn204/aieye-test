import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
  userProfile: UserProfile | null;
  hasVisited: boolean;
  login: (profile: UserProfile) => void;
  markAsVisited: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_PROFILE_KEY = 'aiVisionUserProfile';
const HAS_VISITED_KEY = 'aiVisionHasVisited';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
      return null;
    }
  });

  const [hasVisited, setHasVisited] = useState<boolean>(() => {
    return localStorage.getItem(HAS_VISITED_KEY) === 'true';
  });

  const login = (profile: UserProfile) => {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
       console.error("Failed to save user profile to localStorage", error);
    }
  };

  const markAsVisited = () => {
    try {
      localStorage.setItem(HAS_VISITED_KEY, 'true');
      setHasVisited(true);
    } catch (error) {
       console.error("Failed to mark as visited in localStorage", error);
    }
  };

  return (
    <UserContext.Provider value={{ userProfile, hasVisited, login, markAsVisited }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
