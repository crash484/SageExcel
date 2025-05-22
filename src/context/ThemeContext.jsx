import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('base');
    const [darkMode, setDarkMode] = useState(false);

    // Load saved settings from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedFontSize = localStorage.getItem('fontSize') || 'base';
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';

        setTheme(savedTheme);
        setFontSize(savedFontSize);
        setDarkMode(savedDarkMode);
        applyTheme(savedTheme, savedFontSize, savedDarkMode);
    }, []);

    const applyTheme = (theme, fontSize, darkMode) => {
        const root = document.documentElement;

        // Apply theme classes
        root.classList.remove('light', 'dark', 'system');
        root.classList.add(theme);

        // Apply dark mode
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Apply font size
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        root.classList.add(`text-${fontSize}`);
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme, fontSize, darkMode);
    };

    const updateFontSize = (newSize) => {
        setFontSize(newSize);
        localStorage.setItem('fontSize', newSize);
        applyTheme(theme, newSize, darkMode);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        applyTheme(theme, fontSize, newDarkMode);
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            fontSize,
            darkMode,
            updateTheme,
            updateFontSize,
            toggleDarkMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};