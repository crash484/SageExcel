import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom'; // Changed from Link to NavLink
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toast } from 'react-hot-toast';

const DashboardLayout = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // NavLink active class function
    const navLinkClass = ({ isActive }) =>
        isActive
            ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SageExcel</h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <NavLink
                                    to="/dashboard"
                                    className={navLinkClass}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/upload"
                                    className={navLinkClass}
                                >
                                    Upload
                                </NavLink>
                                <NavLink
                                    to="/history"
                                    className={navLinkClass}
                                >
                                    History
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="ml-3 relative" ref={dropdownRef}>
                                <div>
                                    <button
                                        type="button"
                                        className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        aria-expanded={isDropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    </button>
                                </div>

                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <NavLink
                                            to="/profile"
                                            className={({ isActive }) =>
                                                `block px-4 py-2 text-sm ${isActive ? 'bg-gray-100 dark:bg-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`
                                            }
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Your Profile
                                        </NavLink>
                                        <NavLink
                                            to="/settings"
                                            className={({ isActive }) =>
                                                `block px-4 py-2 text-sm ${isActive ? 'bg-gray-100 dark:bg-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`
                                            }
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Settings
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content area - Using Outlet for nested routes */}
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;