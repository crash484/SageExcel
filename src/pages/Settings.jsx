import React, { useContext } from 'react';
import { toast } from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';

const Settings = () => {
    const {
        theme,
        fontSize,
        darkMode,
        updateTheme,
        updateFontSize,
        toggleDarkMode
    } = useContext(ThemeContext);

    return (
        <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Appearance Settings</h2>

            <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-3">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {['light', 'dark', 'system'].map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    updateTheme(option);
                                    toast.success(`Theme set to ${option}`);
                                }}
                                className={`p-3 rounded-lg border ${theme === option
                                        ? 'border-indigo-500 ring-2 ring-indigo-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            >
                                <span className="capitalize">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                toggleDarkMode();
                                toast.success(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Font Size */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-3">Font Size</h3>
                    <div className="flex gap-4">
                        {['sm', 'base', 'lg'].map((size) => (
                            <button
                                key={size}
                                onClick={() => {
                                    updateFontSize(size);
                                    toast.success(`Font size updated`);
                                }}
                                className={`px-4 py-2 rounded-md ${fontSize === size
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                {size === 'sm' ? 'Small' : size === 'base' ? 'Medium' : 'Large'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;