import React, { useEffect } from 'react';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux'


const Dashboard =  () => {
    const  token  = useSelector((state) => state.auth.token)
    //this makes so that it will always verify the token once when the page is loaded at first
    useEffect(()=>{
        (async () => {
            try {
            // Your async code here
                const response = await fetch('http://localhost:5000/api/auth/verify', {
                    method: 'POST',
                    headers:{
                    'Content-Type': 'application/json',
                    'Authorization':`Bearer ${token}`
                    }
                })
                const data = await response.json()     
                console.log('Verification result:', data);
            } catch (error) {
                console.error(error);
            }
        })();
    },[])
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Welcome to your Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Files Uploaded</h3>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Analyses Performed</h3>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Saved Charts</h3>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">0</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Recent Activity</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;