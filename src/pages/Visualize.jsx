// Full updated Visualize.jsx with 3D chart support using react-plotly.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { FiDownload, FiRefreshCw, FiUpload } from 'react-icons/fi';
import XLSX from 'xlsx';
import Plot from 'react-plotly.js';

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
    const [zAxis, setZAxis] = useState('');
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
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error('File not found');
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                if (jsonData.length > 0) {
                    const extractedHeaders = jsonData[0];
                    const previewRows = jsonData.slice(1).map((row) => {
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
                    setZAxis(extractedHeaders.length > 2 ? extractedHeaders[2] : extractedHeaders[0]);
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
        data.forEach((row) => {
            const key = row[groupCol];
            const value = parseFloat(row[valueCol]) || 0;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(value);
        });
        return Object.entries(grouped).map(([key, values]) => ({
            label: key,
            value:
                operation === 'sum'
                    ? values.reduce((a, b) => a + b, 0)
                    : operation === 'avg'
                        ? values.reduce((a, b) => a + b, 0) / values.length
                        : values.length,
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
        setZAxis(headers.length > 2 ? headers[2] : headers[0]);
        setGroupBy(headers[0]);
        setAggregation('sum');
        setChartTitle('My Chart');
    };

    const ChartComponent = {
        bar: Bar, line: Line, pie: Pie, doughnut: Doughnut, radar: Radar, scatter: Scatter
    }[chartType];

    const renderChart = () => {
        if (chartType === '3dscatter') {
            return <Plot
                data={[{
                    type: 'scatter3d',
                    mode: 'markers',
                    x: data.map(row => parseFloat(row[xAxis])),
                    y: data.map(row => parseFloat(row[yAxis])),
                    z: data.map(row => parseFloat(row[zAxis])),
                    marker: { size: 5, color: 'rgb(23, 190, 207)' }
                }]}
                layout={{ title: chartTitle, autosize: true, height: 400 }}
            />;
        }
        if (chartType === '3dsurface') {
            return <Plot
                data={[{
                    type: 'surface',
                    z: [data.map(row => parseFloat(row[zAxis]) || 0)]
                }]}
                layout={{ title: chartTitle, autosize: true, height: 400 }}
            />;
        }
        if (chartType === '3dmesh') {
            return <Plot
                data={[{
                    type: 'mesh3d',
                    x: data.map(row => parseFloat(row[xAxis])),
                    y: data.map(row => parseFloat(row[yAxis])),
                    z: data.map(row => parseFloat(row[zAxis]))
                }]}
                layout={{ title: chartTitle, autosize: true, height: 400 }}
            />;
        }
        if (chartType === '3dbar') {
            return <Plot
                data={[{
                    type: 'bar3d', // Note: Plotly doesn't support bar3d directly; this will be visualized using layout tweaks
                    x: data.map(row => row[xAxis]),
                    y: data.map(row => row[yAxis]),
                    z: data.map(row => parseFloat(row[zAxis])),
                    type: 'scatter3d',
                    mode: 'markers',
                    marker: { size: 10, color: data.map(row => parseFloat(row[zAxis])), colorscale: 'Viridis' }
                }]}
                layout={{
                    title: chartTitle,
                    scene: { xaxis: { title: xAxis }, yaxis: { title: yAxis }, zaxis: { title: zAxis } },
                    autosize: true,
                    height: 400
                }}
            />;
        }
        return <ChartComponent id="chart-canvas" data={generateChartData()} options={chartOptions} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Excel Analytics Platform</h1>
                    <button onClick={() => navigate('/upload')} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <FiUpload className="mr-2" /> Upload New File
                    </button>
                </div>
                {chartData && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Chart Title</label>
                                <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Chart Type</label>
                                <select value={chartType} onChange={e => setChartType(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700">
                                    <option value="bar">Bar</option>
                                    <option value="line">Line</option>
                                    <option value="pie">Pie</option>
                                    <option value="doughnut">Doughnut</option>
                                    <option value="radar">Radar</option>
                                    <option value="scatter">Scatter</option>
                                    <option value="3dscatter">3D Scatter</option>
                                    <option value="3dsurface">3D Surface</option>
                                    <option value="3dmesh">3D Mesh</option>
                                    {/* <option value="3dbar">3D Bar</option> */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">X-Axis</label>
                                <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700">
                                    {headers.map((h, i) => <option key={i}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Y-Axis</label>
                                <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700">
                                    {headers.map((h, i) => <option key={i}>{h}</option>)}
                                </select>
                            </div>
                            {(chartType === '3dscatter' || chartType === '3dsurface' || chartType === '3dmesh' || chartType === '3dbar') && (
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Z-Axis</label>
                                    <select value={zAxis} onChange={e => setZAxis(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700">
                                        {headers.map((h, i) => <option key={i}>{h}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex space-x-2 pt-4">
                                <button onClick={handleReset} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center">
                                    <FiRefreshCw className="mr-2" /> Reset
                                </button>
                                <button onClick={() => document.getElementById('chart-canvas')?.toDataURL && downloadChart()} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                                    <FiDownload className="mr-2" /> Export
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="h-96">{renderChart()}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
