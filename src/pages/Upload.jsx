import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { FiUpload, FiX, FiFile, FiCheckCircle } from 'react-icons/fi';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux';
import SendRequest from '../api/SendRequest';

// Development mode configuration
const DEV_MODE = false;
const DEV_MODE_UPLOAD_DELAY = 1500; // ms
const DEV_MODE_PROGRESS_INTERVAL = 100; // ms
const PREVIEW_ROW_COUNT = 5;

export default function Upload() {
    const token = useSelector(selectCurrentToken);
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isTokenValid, setIsTokenValid] = useState(DEV_MODE); // Default to true in dev mode

    // Token verification - simplified for development
    useEffect(() => {
        if (!DEV_MODE) {
            const verifyToken = async () => {
                try {
                    const data = await SendRequest(token);
                    console.log("verification result ", data);
                    setIsTokenValid(true);
                } catch (error) {
                    setIsTokenValid(false);
                    toast.error('Session expired. Please login again.');
                }
            };
            verifyToken();
        }
    }, [token]);

    const onDrop = useCallback((acceptedFiles) => {
        if (!isTokenValid) {
            toast.error('Please login to upload files');
            return;
        }

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
                setPreviewData(jsonData.slice(1, PREVIEW_ROW_COUNT + 1));
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

    const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    setIsLoading(false);
                    setUploadProgress(0);
                    toast.success('File upload simulated successfully!');
                    setFile(null);
                    setHeaders([]);
                    setPreviewData([]);
                }, 300);
            }
            setUploadProgress(progress);
        }, DEV_MODE_PROGRESS_INTERVAL);
    };

    const handleUpload = async () => {
        if (!isTokenValid) {
            toast.error('Session expired. Please login again.');
            return;
        }

        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        if (DEV_MODE) {
            console.log('[DEV] Simulating upload:', {
                filename: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                headers: headers,
                sampleData: previewData.slice(0, 2)
            });
            simulateUpload();
            return;
        }

        // Production implementation
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:5000/api/auth/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
        } catch (error) {
            toast.error('An error occurred during upload');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTokenValid) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Authentication Required
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Please login to access the upload feature.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {DEV_MODE ? 'DEV MODE: ' : ''}Excel File Upload
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {DEV_MODE ? 'Simulating file uploads - no data will be saved' : 'Upload your data for analysis'}
                    </p>
                    {DEV_MODE && (
                        <div className="mt-3 inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                            Development Mode Active
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <FiUpload className="h-10 w-10 text-gray-400 dark:text-gray-300" />
                            {isDragActive ? (
                                <p className="text-indigo-600 dark:text-indigo-300 font-medium">
                                    Drop your Excel file here
                                </p>
                            ) : (
                                <>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium">
                                        Drag & drop files here, or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Supported formats: .xlsx, .xls
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {file && (
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <FiFile className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            {headers.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Detected Columns
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {headers.map((header, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm"
                                            >
                                                {header}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Data Preview (First {PREVIEW_ROW_COUNT} Rows)
                                        </h3>
                                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        {headers.map((header, index) => (
                                                            <th
                                                                key={index}
                                                                scope="col"
                                                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
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
                                                                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                                                                >
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Showing first {Math.min(previewData.length, PREVIEW_ROW_COUNT)} rows of data
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isLoading && (
                                <div className="pt-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                                        <span className="font-medium">{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={isLoading || !file}
                                className={`w-full mt-4 flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${isLoading || !file ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {DEV_MODE ? 'Simulating Upload...' : 'Uploading...'}
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="mr-2 h-5 w-5" />
                                        {DEV_MODE ? 'Simulate Upload' : 'Upload File'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}