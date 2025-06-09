import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../store/authSlice';
import SendRequest from '../../src/api/SendRequest';
import { motion } from 'framer-motion';
import { FaFileAlt, FaChartBar, FaSave } from 'react-icons/fa';

const Dashboard = () => {
    const token = useSelector(selectCurrentToken);
    const [fileCount,setFileCount]=useState(0);
    const [file,setFile] = useState([{
        "filename":"",
        "date":""
    }])

    useEffect(() => {
        const getInfo=(async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/getFiles', {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`
                 }
            });
            const data = await response.json();
            if(response.ok){
                const user= data.user;
                const allFiles = user.uploadedFiles;
                const fileData = allFiles.map(file =>({
                    filename: file.filename,
                    date: file.date
                }))
                setFile(fileData);
            }
            } catch (error) {
                console.error(error);
            }
        });
        getInfo();

    }, [token]);

    const stats = [
        { icon: <FaFileAlt />, label: 'Files Uploaded', value: file.length },
        { icon: <FaChartBar />, label: 'Analyses Performed', value: 12 },
        { icon: <FaSave />, label: 'Saved Charts', value: 8 },
    ];

        const activities = file.slice(-3).reverse().map(f => ({
            action: `Uploaded ${f.filename}`,
            time: new Date(f.date).toLocaleString(),
        }));
    

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                📊 Welcome to your Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(({ icon, label, value }, index) => (
                    <motion.div
                        key={label}
                        className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-md"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-indigo-600 dark:text-indigo-400 text-3xl">{icon}</div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{label}</h3>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📁 Recent Activity</h3>
                <div className="space-y-4">
                    {activities.map((activity, i) => (
                        <motion.div
                            key={i}
                            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                        >
                            <p className="text-gray-700 dark:text-gray-200">{activity.action}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
