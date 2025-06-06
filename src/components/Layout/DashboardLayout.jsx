import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const DashboardLayout = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    // THEME TOGGLE
    const [theme, setTheme] = useState(() =>
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    // DROPDOWN
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        isActive
            ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center">
                        {/* MOBILE MENU BUTTON */}
                        <button
                            className="sm:hidden text-gray-600 dark:text-gray-200 mr-4"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SageExcel</h1>
                        <div className="hidden sm:flex sm:space-x-8 ml-6">
                            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                            <NavLink to="/upload" className={navLinkClass}>Upload</NavLink>
                            <NavLink to="/history" className={navLinkClass}>History</NavLink>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* THEME TOGGLE */}
                        <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-300 hover:text-indigo-500">
                            {theme === 'dark' ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>

                        {/* PROFILE DROPDOWN */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50"
                                    >
                                        <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">Your Profile</NavLink>
                                        <NavLink to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">Settings</NavLink>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">Sign out</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 left-0 z-40 w-64 h-full bg-white dark:bg-gray-800 shadow-lg p-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <XIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-4">
                            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                            <NavLink to="/upload" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Upload</NavLink>
                            <NavLink to="/history" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>History</NavLink>
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
