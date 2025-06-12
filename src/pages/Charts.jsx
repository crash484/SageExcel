import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux';
import SendRequest from '../../src/api/SendRequest';
import { FiTrash2, FiEye, FiBarChart2, FiPieChart, FiLineChart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";

const DEV_MODE = false;

export default function Charts() {
    const navigate = useNavigate();
    const token = useSelector(selectCurrentToken);
    const [visuals, setVisuals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(DEV_MODE ? true : false);

    const mockVisuals = [
        {
            id: '1',
            title: 'Revenue by Region',
            chartType: 'bar',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Customer Ratings',
            chartType: 'pie',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '3',
            title: 'Inventory Trend',
            chartType: 'line',
            createdAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    useEffect(() => {
        const fetchVisuals = async () => {
            try {
                if (!DEV_MODE) {
                    const authData = await SendRequest(token);
                    setIsTokenValid(true);
                    console.log('Token verification:', authData);
                } else {
                    console.log('DEV MODE: Skipping token check');
                }

                if (DEV_MODE) {
                    setTimeout(() => {
                        setVisuals(mockVisuals);
                        setIsLoading(false);
                    }, 500);
                } else {
                    const response = await fetch('http://localhost:5000/api/auth/getVisuals', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setVisuals(data.visuals);
                        setIsLoading(false);
                    } else {
                        throw new Error(data.message || "Failed to fetch visualizations");
                    }
                }
            } catch (err) {
                toast.error(err.message || 'Error loading visualizations');
                setIsLoading(false);
            }
        };

        fetchVisuals();
    }, [token]);

    const handleDelete = async (id) => {
        if (DEV_MODE) {
            setVisuals(prev => prev.filter(vis => vis.id !== id));
            toast.success('[DEV] Visualization deleted');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/deleteVisual/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                setVisuals(prev => prev.filter(vis => vis._id !== id));
                toast.success('Visualization deleted');
            } else {
                throw new Error(data.message || 'Failed to delete');
            }
        } catch (err) {
            toast.error(err.message || 'Error deleting visualization');
        }
    };

    const handleView = (id) => {
        navigate(`/visualize/detail`, { state: { id, token } });
    };

    const formatDate = (date) =>
        new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    const renderIcon = (type) => {
        switch (type) {
            case 'bar': return <FiBarChart2 className="text-indigo-600 text-2xl" />;
            case 'line': return <FiLineChart className="text-blue-600 text-2xl" />;
            case 'pie': return <FiPieChart className="text-pink-600 text-2xl" />;
            default: return <FiBarChart2 className="text-gray-500 text-2xl" />;
        }
    };

    if (!DEV_MODE && !isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
                    <p>Please log in again to view your visualizations.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 px-6 py-10">
            <div className="text-center mb-12">
                <motion.h1
                    className="text-4xl font-extrabold text-indigo-800 dark:text-white mb-4"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    Your Visualizations
                </motion.h1>
                <motion.p
                    className="text-lg text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    View and manage all your generated charts and insights.
                </motion.p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visuals.length > 0 ? visuals.map((vis, i) => (
                        <motion.div
                            key={vis.id || vis._id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-xl transition"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {renderIcon(vis.chartType)}
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">{vis.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{vis.chartType} chart</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created: {formatDate(vis.createdAt)}</p>
                            <div className="flex justify-between mt-4">
                                <button onClick={() => handleView(vis.id || vis._id)} title="View Visualization">
                                    <FiEye className="text-green-600 hover:text-green-800 text-xl" />
                                </button>
                                <button onClick={() => handleDelete(vis.id || vis._id)} title="Delete Visualization">
                                    <FiTrash2 className="text-red-600 hover:text-red-800 text-xl" />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <p className="text-center text-gray-600 dark:text-gray-300 col-span-full">
                            No visualizations available yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
