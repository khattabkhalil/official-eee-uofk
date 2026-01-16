'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('ar');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedLanguage = localStorage.getItem('language') || 'ar';

        setTheme(savedTheme);
        setLanguage(savedLanguage);

        // Apply theme
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', savedLanguage);

        // Check if admin is logged in
        const token = localStorage.getItem('adminToken');
        const admin = localStorage.getItem('adminData');

        if (token && admin) {
            try {
                const parsedAdmin = JSON.parse(admin);
                if (parsedAdmin && parsedAdmin.id) {
                    setIsAdmin(true);
                    setAdminData(parsedAdmin);
                }
            } catch (e) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
            }
        }
        setAuthLoading(false);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleLanguage = () => {
        const newLanguage = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
        document.documentElement.setAttribute('dir', newLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', newLanguage);
    };

    const login = (token, admin) => {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));
        setIsAdmin(true);
        setAdminData(admin);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setIsAdmin(false);
        setAdminData(null);
    };

    const t = (ar, en) => {
        return language === 'ar' ? ar : en;
    };

    return (
        <AppContext.Provider value={{
            theme,
            language,
            isAdmin,
            adminData,
            authLoading,
            toggleTheme,
            toggleLanguage,
            login,
            logout,
            t
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
