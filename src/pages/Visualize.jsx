import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { FiDownload, FiRefreshCw, FiUpload } from 'react-icons/fi';
import XLSX from "xlsx"


ChartJS.register(...registerables);

export default function Visualize() {
    const location = useLocation();
    const fileId = location.state?.id;
    const token = location.state?.token;
    const navigate = useNavigate();
    const [chartData, setChartData] = useState(null);
    const [chartType, setChartType] = useState('bar');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [headers,setHeaders] = useState([]);
    const [data,setData] = useState([]);

    // useEffect(() => {
    //     if (location.state?.uploadedData) {
    //         const { headers, data } = location.state.uploadedData;
    //         setChartData({ headers, data });
    //         setXAxis(headers[0]);
    //         setYAxis(headers.length > 1 ? headers[1] : headers[0]);
    //     }
    // }, [location.state]);

    //getting the file from db
    useEffect(()=>{
        const getFile = async()=>{
        try{
            const url = `http://localhost:5000/api/auth/preview/${fileId}`
            const response = await fetch(url,{
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                });
             if (!response.ok) throw new Error("File not found");

             const blob = await response.blob();
             const arrayBuffer = await blob.arrayBuffer();

             // Parse the Excel file
             const workbook = XLSX.read(arrayBuffer, { type: 'array' });
             const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
             const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

             if (jsonData.length > 0) {
                    const extractedHeaders = jsonData[0];
                    const previewRows = jsonData.slice(1).map(row => {
                    const obj = {};
                    extractedHeaders.forEach((header, i) => {
                        obj[header] = row[i];
                    });
                    return obj;
                    });

                    setHeaders(extractedHeaders);
                    setData(previewRows);
                    setChartData({ headers: extractedHeaders, data: previewRows });
                    setXAxis(extractedHeaders[0]);
                    setYAxis(extractedHeaders.length > 1 ? extractedHeaders[1] : extractedHeaders[0]);
                }
                } catch (err) {
                console.error(err);
                }
            }
        getFile()
    },[])

    const generateChartData = () => {
        if (!chartData || !xAxis) return { labels: [], datasets: [] };

        const labels = chartData.data.map(item => item[xAxis]);
        const values = chartData.data.map(item => item[yAxis] || item[xAxis]);

        return {
            labels,
            datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(220, 38, 38, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(234, 179, 8, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(220, 38, 38, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 1
            }]
        };
    };

    const downloadChart = () => {
        const canvas = document.getElementById('chart-canvas');
        const link = document.createElement('a');
        link.download = `${chartType}-chart.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Data Visualization
                    </h1>
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <FiUpload className="mr-2" />
                        Upload New File
                    </button>
                </div>

                {chartData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Controls Panel */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                                Chart Configuration
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Chart Type
                                    </label>
                                    <select
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="pie">Pie Chart</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        X-Axis
                                    </label>
                                    <select
                                        value={xAxis}
                                        onChange={(e) => setXAxis(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        {chartData.headers.map((header, index) => (
                                            <option key={index} value={header}>{header}</option>
                                        ))}
                                    </select>
                                </div>

                                {chartType !== 'pie' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Y-Axis
                                        </label>
                                        <select
                                            value={yAxis}
                                            onChange={(e) => setYAxis(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            {chartData.headers.map((header, index) => (
                                                <option key={index} value={header}>{header}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex space-x-2 pt-4">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <FiRefreshCw className="mr-2" /> Reset
                                    </button>
                                    <button
                                        onClick={downloadChart}
                                        className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        <FiDownload className="mr-2" /> Export
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="h-96">
                                {chartType === 'bar' && (
                                    <Bar
                                        id="chart-canvas"
                                        data={generateChartData()}
                                        options={chartOptions}
                                    />
                                )}
                                {chartType === 'line' && (
                                    <Line
                                        id="chart-canvas"
                                        data={generateChartData()}
                                        options={chartOptions}
                                    />
                                )}
                                {chartType === 'pie' && (
                                    <Pie
                                        id="chart-canvas"
                                        data={generateChartData()}
                                        options={chartOptions}
                                    />
                                )}
                            </div>

                            {/* Data Table Preview */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                                    Data Preview
                                </h3>
                                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                {chartData.headers.map((header, index) => (
                                                    <th
                                                        key={index}
                                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {chartData.data.slice(0, 5).map((row, i) => (
                                                <tr key={i}>
                                                    {chartData.headers.map((header, j) => (
                                                        <td
                                                            key={j}
                                                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                                                        >
                                                            {row[header]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No chart data available. Please upload a file first.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}