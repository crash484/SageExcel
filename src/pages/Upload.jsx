import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { FiUpload, FiX, FiFile, FiCheckCircle } from 'react-icons/fi';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux';
import SendRequest from '../../src/api/SendRequest';

export default function Upload() {
    const token = useSelector(selectCurrentToken);
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(true); // Default to true for development

    // Token verification - kept but bypassed for development
    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Comment out for development
                // const data = await SendRequest(token);
                // console.log('Verification result:', data);
                // setIsTokenValid(true);

                // For development only - remove in production
                console.log('Bypassing token verification for development');
                setIsTokenValid(true);
            } catch (error) {
                console.error('Token verification failed:', error);
                toast.error('Session expired. Please login again.');
                setIsTokenValid(false);
            }
        };
        verifyToken();
    }, [token]);

    const onDrop = useCallback((acceptedFiles) => {
        // Temporarily comment out token check for development
        // if (!isTokenValid) {
        //     toast.error('Please login to upload files');
        //     return;
        // }

        if (acceptedFiles.length === 0) return;

        const selectedFile = acceptedFiles[0];

        if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(selectedFile.type)) {
            toast.error('Please upload an Excel file (.xlsx or .xls)');
            return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length > 0) {
                setHeaders(jsonData[0]);
                setPreviewData(jsonData.slice(1, 6));
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    }, [isTokenValid]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    const removeFile = () => {
        setFile(null);
        setHeaders([]);
        setPreviewData([]);
    };

    const handleUpload = async () => {
        // Temporarily comment out token check for development
        // if (!isTokenValid) {
        //     toast.error('Session expired. Please login again.');
        //     return;
        // }

        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // For development, log instead of actually sending
            console.log('Simulating file upload with data:', {
                filename: file.name,
                size: file.size,
                headers: headers,
                previewData: previewData
            });

            // Simulate API response
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('File upload simulated successfully!');
            setFile(null);
            setHeaders([]);
            setPreviewData([]);

            /* Actual API call - uncomment for production
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('File uploaded successfully!');
                setFile(null);
                setHeaders([]);
                setPreviewData([]);
            } else {
                toast.error(data.message || 'File upload failed');
            }
            */
        } catch (error) {
            toast.error('An error occurred during upload');
            console.error('Upload error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Temporarily bypass token check for development
    // if (!isTokenValid) {
    //     return (
    //         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
    //             <div className="text-center">
    //                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verifying your session...</h1>
    //                 <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your authentication token.</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Excel File</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Upload your Excel file to analyze and visualize the data
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
                    {/* Dropzone Area */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <FiUpload className="h-10 w-10 text-gray-400 dark:text-gray-300" />
                            {isDragActive ? (
                                <p className="text-indigo-600 dark:text-indigo-300 font-medium">
                                    Drop the Excel file here...
                                </p>
                            ) : (
                                <>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium">
                                        Drag & drop an Excel file here, or click to select
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Supported formats: .xlsx, .xls
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Selected File Preview */}
                    {file && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <FiFile className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                                    <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-xs">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </span>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Headers Preview */}
                            {headers.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                        Detected Headers
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {headers.map((header, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium"
                                            >
                                                {header}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Data Preview */}
                            {previewData.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                        Data Preview (first 5 rows)
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    {headers.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {previewData.map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {row.map((cell, cellIndex) => (
                                                            <td
                                                                key={cellIndex}
                                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="mt-8">
                                <button
                                    onClick={handleUpload}
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle className="mr-2 h-5 w-5" />
                                            Upload File
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}