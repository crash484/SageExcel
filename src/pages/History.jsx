import React, { useEffect, useState } from 'react';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux';
import SendRequest from '../../src/api/SendRequest';
import { FiDownload, FiTrash2, FiEye, FiClock, FiFile } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Development mode flag - set to false when deploying to production
const DEV_MODE = false;

export default function History() {
    const token = useSelector(selectCurrentToken);
    const [uploads, setUploads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(DEV_MODE ? true : false); // Bypass auth in dev mode

    // Mock data for development
    const mockData = [
        {
            id: '1',
            filename: 'sales_Q2_2023.xlsx',
            date: new Date().toISOString(),
            headers: ['Product', 'Region', 'Revenue', 'Units Sold'],
            size: '356 KB',
            status: 'processed'
        },
        {
            id: '2',
            filename: 'customer_feedback.xlsx',
            date: new Date(Date.now() - 86400000).toISOString(),
            headers: ['Customer ID', 'Rating', 'Comments', 'Date'],
            size: '512 KB',
            status: 'processed'
        },
        {
            id: '3',
            filename: 'inventory_may.xlsx',
            date: new Date(Date.now() - 172800000).toISOString(),
            headers: ['SKU', 'Item Name', 'Quantity', 'Location'],
            size: '278 KB',
            status: 'processed'
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!DEV_MODE) {
                    // PRODUCTION: Actual token verification
                    const authData = await SendRequest(token);
                    setIsTokenValid(true);
                    console.log('Token verification result:', authData);
                } else {
                    // DEVELOPMENT: Bypass auth
                    console.log('Development mode - bypassing auth');
                }

                if (DEV_MODE) {
                    // DEVELOPMENT: Use mock data with delay to simulate API call
                    setTimeout(() => {
                        setUploads(mockData);
                        setIsLoading(false);
                    }, 800);
                } else {
                    // PRODUCTION: Actual API call
                    // const response = await SendRequest(token, '/api/uploads/history');
                    // setUploads(response.data);
                    // setIsLoading(false);
                    const response = await fetch('http://localhost:5000/api/auth/getFiles',{
                        headers:{
                            'Authorization':`Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        const user = data.user;
                        const files = user.uploadedFiles;
                        setUploads(files);
                        setIsLoading(false)
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error(DEV_MODE ? 'Mock error simulation' : error.message || 'Failed to load history');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleDownload = async (fileId,fileName) => {
        if (DEV_MODE) {
            // DEVELOPMENT: Simulate download
            toast.success(`[DEV] Would download file ${fileId}`);
            console.log('Would download file:', fileId);
            return;
        }

        // PRODUCTION: Actual download implementation
        // try {
        //     const response = await SendRequest(token, `/api/uploads/${fileId}/download`);
        //     // Handle file download...
        //     toast.success('Download started');
        // } catch (error) {
        //     toast.error('Download failed');
        // }
        try{
            const response =  await fetch(`http://localhost:5000/api/auth/download/${fileId}`,{
                method : 'GET',
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });

            if(!response.ok) throw new Error('File download Failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'download'
            document.body.appendChild(a);
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url);
        }catch(err){
            console.error(err);
            toast.error('Download Failed')
        }

    };

    const handleDelete = async (fileId) => {
        if (DEV_MODE) {
            // DEVELOPMENT: Simulate deletion
            setUploads(uploads.filter(upload => upload.id !== fileId));
            toast.success('[DEV] File deleted (simulated)');
            console.log('Would delete file:', fileId);
            return;
        }

        // PRODUCTION: Actual deletion
        // try {
        //     await SendRequest(token, `/api/uploads/${fileId}`, 'DELETE');
        //     setUploads(uploads.filter(upload => upload.id !== fileId));
        //     toast.success('File deleted');
        // } catch (error) {
        //     toast.error('Deletion failed');
        // }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Skip token check in development
    if (!DEV_MODE && !isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
                    <p>Please login again to view your history</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Upload History
                    </h1>
                    {DEV_MODE && (
                        <div className="mt-2 inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                            Development Mode Active
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Table Headers */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        File
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Data Columns
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {uploads.length > 0 ? (
                                    uploads.map((upload) => (
                                        <tr key={upload._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiFile className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-300" />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {upload.filename}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {upload.size}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {upload.headers.slice(0, 3).map((header, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                                        >
                                                            {header}
                                                        </span>
                                                    ))}
                                                    {upload.headers.length > 3 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                            +{upload.headers.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <FiClock className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-300" />
                                                    {formatDate(upload.date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    {/*this button is for downloading  */}
                                                    <button
                                                        onClick={() => handleDownload(upload._id,upload.filename)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                                                        title="Download"
                                                    >
                                                        <FiDownload className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toast.success('[DEV] Preview would open here')}
                                                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                                                        title="Preview"
                                                    >
                                                        <FiEye className="h-5 w-5" />
                                                    </button>
                                                    {/*this button is for deleting  */}
                                                    <button
                                                        onClick={() => handleDelete(upload._id,upload.filename)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {DEV_MODE ? 'No mock uploads available' : 'No uploads found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}