import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { FiDownload, FiRefreshCw, FiUpload } from 'react-icons/fi';
import XLSX from 'xlsx';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import analyticsAnimation from './animation/Animation - 1749444335721.json';

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
    const [headers, setHeaders] = useState([]);
    const [data, setData] = useState([]);
    const [groupBy, setGroupBy] = useState('');
    const [aggregation, setAggregation] = useState('sum');
    const [chartTitle, setChartTitle] = useState('My Chart');

    useEffect(() => {
        const getFile = async () => {
            try {
                const url = `http://localhost:5000/api/auth/preview/${fileId}`;
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('File not found');
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
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
                    setGroupBy(extractedHeaders[0]);
                }
            } catch (err) {
                console.error(err);
            }
        };
        getFile();
    }, []);

    const groupByAndAggregate = (groupCol, valueCol, operation = 'sum') => {
        const grouped = {};
        data.forEach(row => {
            const key = row[groupCol];
            const value = parseFloat(row[valueCol]) || 0;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(value);
        });
        return Object.entries(grouped).map(([key, values]) => ({
            label: key,
            value: operation === 'sum'
                ? values.reduce((a, b) => a + b, 0)
                : operation === 'avg'
                    ? values.reduce((a, b) => a + b, 0) / values.length
                    : values.length
        }));
    };

    const generateColors = (count) => {
        const baseColors = [
            'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)', 'rgba(255, 140, 184, 0.6)',
            'rgba(100, 255, 218, 0.6)'
        ];
        const borderColors = baseColors.map(c => c.replace('0.6', '1'));
        return {
            backgroundColor: Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]),
            borderColor: Array.from({ length: count }, (_, i) => borderColors[i % borderColors.length])
        };
    };

    const generateChartData = () => {
        if (!data || !xAxis) return { labels: [], datasets: [] };
        const finalData = groupBy && yAxis
            ? groupByAndAggregate(groupBy, yAxis, aggregation)
            : data.map(row => ({ label: row[xAxis], value: parseFloat(row[yAxis]) || 0 }));

        const colors = generateColors(finalData.length);
        return {
            labels: finalData.map(d => d.label),
            datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: finalData.map(d => d.value),
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
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
            title: {
                display: true,
                text: chartTitle,
                font: { size: 18, weight: 'bold' }
            },
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: context => `${context.label}: ${context.raw}`
                }
            }
        }
    };

    const handleReset = () => {
        setChartType('bar');
        setXAxis(headers[0]);
        setYAxis(headers.length > 1 ? headers[1] : headers[0]);
        setGroupBy(headers[0]);
        setAggregation('sum');
        setChartTitle('My Chart');
    };

    const ChartComponent = {
        bar: Bar, line: Line, pie: Pie, doughnut: Doughnut, radar: Radar, scatter: Scatter
    }[chartType];

    return (
        <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-indigo-100 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-300">📊 Data Canvas</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                        Explore insights from your Excel files with interactive visualizations.
                    </p>
                </motion.div>

                {!chartData ? (
                    <div className="flex justify-center">
                        <Lottie animationData={analyticsAnimation} className="h-96 w-96" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Configure Chart</h2>
                            <div className="space-y-4">
                                <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Title</label>
                                <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} placeholder="Chart Title"
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-sm" />

                                <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Chart</label>
                                <select value={chartType} onChange={e => setChartType(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                    <option value="bar">📊 Bar</option>
                                    <option value="line">📈 Line</option>
                                    <option value="pie">🥧 Pie</option>
                                    <option value="doughnut">🍩 Doughnut</option>
                                    <option value="radar">📉 Radar</option>
                                    <option value="scatter">🔬 Scatter</option>
                                </select>

                                <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Select X-Axis</label>
                                <select value={xAxis} onChange={e => setXAxis(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                    {headers.map((h, i) => <option key={i}>{h}</option>)}
                                </select>

                                {chartType !== 'pie' && (
                                    <>
                                        <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Select Y-Axis</label>
                                        <select value={yAxis} onChange={e => setYAxis(e.target.value)}
                                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                            {headers.map((h, i) => <option key={i}>{h}</option>)}
                                        </select>
                                        <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Group-By</label>
                                        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
                                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                            {headers.map((h, i) => <option key={i}>{h}</option>)}
                                        </select>
                                        <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Aggregation Type</label>
                                        <select value={aggregation} onChange={e => setAggregation(e.target.value)}
                                            className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                            <option value="sum">Sum</option>
                                            <option value="avg">Average</option>
                                            <option value="count">Count</option>
                                        </select>
                                    </>
                                )}

                                <div className="flex space-x-2">
                                    <button onClick={handleReset} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg py-2 hover:bg-gray-400">
                                        <FiRefreshCw className="inline mr-1" /> Reset
                                    </button>
                                    <button onClick={downloadChart} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700">
                                        <FiDownload className="inline mr-1" /> Export
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <motion.div
                                key={chartType}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="h-96"
                            >
                                <ChartComponent id="chart-canvas" data={generateChartData()} options={chartOptions} />
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
