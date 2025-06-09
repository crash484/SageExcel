import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentToken } from '../store/authSlice';
import { motion } from 'framer-motion';
import { FaUserShield, FaUserAlt } from 'react-icons/fa';


const mockUsers = [
    { id: 1, username: 'john_doe', uploadedFiles: 5, isAdmin: false },
    { id: 2, username: 'admin_girl', uploadedFiles: 12, isAdmin: true },
    { id: 3, username: 'sammy', uploadedFiles: 2, isAdmin: false },
];

const AdminDashboard = () => {
    const token = useSelector(selectCurrentToken);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fake auth check using token (mocking a real request)
        // You'd replace this with an API call to validate token & get user info
        const checkAdmin = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/auth/getUser",{
                    headers:{
                        'Authorization': `Bearer${token}`
                    }
                });
                const data = await response.json();
            } catch (err) {
                console.error('Auth check failed', err);
                navigate('/dashboard');
            }
        };

        checkAdmin();
        setUsers(mockUsers); // Load mock data
    }, [token, navigate]);

    const toggleAdmin = (id) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, isAdmin: !user.isAdmin } : user
            )
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                🛠️ Admin Dashboard
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md text-left">
                    <thead>
                        <tr className="text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
                            <th className="px-4 py-3">Username</th>
                            <th className="px-4 py-3">Files Uploaded</th>
                            <th className="px-4 py-3">Admin Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-200">
                                    {user.username}
                                </td>
                                <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                                    {user.uploadedFiles}
                                </td>
                                <td className="px-4 py-3">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <FaUserShield /> Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                            <FaUserAlt /> User
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleAdmin(user.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition"
                                    >
                                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
