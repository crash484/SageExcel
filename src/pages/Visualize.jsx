import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import analyticsAnimation from './animation/Animation - 1749444335721.json';
import * as THREE from 'three';
import toast from 'react-hot-toast';

ChartJS.register(...registerables);

// 3D Chart Component
const Chart3D = ({ data, chartType, title, onRef }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const animationIdRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current || !data || !data.labels) return;

        // Clean up previous scene
        if (rendererRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
            rendererRef.current.dispose();
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 10, 10);
        scene.add(pointLight);

        // Create 3D chart based on type
        create3DChart(scene, data, chartType);

        // Camera positioning
        if (chartType === '3d-pie') {
            camera.position.set(0, 8, 12);
        } else {
            camera.position.set(15, 12, 15);
        }
        camera.lookAt(0, 0, 0);

        // Add mouse controls
        let mouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        const onMouseDown = (event) => {
            mouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const onMouseUp = () => {
            mouseDown = false;
        };

        const onMouseMove = (event) => {
            if (!mouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);

            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('mousemove', onMouseMove);

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Expose renderer for screenshot
        if (onRef) {
            onRef(renderer);
        }

        // Cleanup
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            renderer.domElement.removeEventListener('mouseup', onMouseUp);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
        };
    }, [data, chartType, title]);

    const create3DChart = (scene, data, type) => {
        const values = data.datasets[0].data;
        const labels = data.labels;
        const maxValue = Math.max(...values);

        // Color palette
        const colors = [
            0xff6384, 0x36a2eb, 0xffce56, 0x4bc0c0, 0x9966ff,
            0xff9f40, 0xc7c7c7, 0x5366ff, 0xff8cc8, 0x64ffda
        ];

        if (type === '3d-bar') {
            // 3D Bar Chart
            values.forEach((value, index) => {
                const height = (value / maxValue) * 8;
                const geometry = new THREE.BoxGeometry(1.2, height, 1.2);
                const material = new THREE.MeshLambertMaterial({
                    color: colors[index % colors.length],
                    transparent: true,
                    opacity: 0.8
                });
                const bar = new THREE.Mesh(geometry, material);

                bar.position.x = (index - values.length / 2) * 2;
                bar.position.y = height / 2;
                bar.castShadow = true;
                bar.receiveShadow = true;

                scene.add(bar);

                // Add label
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 256;
                canvas.height = 64;
                context.fillStyle = '#333';
                context.font = '24px Arial';
                context.textAlign = 'center';
                context.fillText(labels[index], 128, 40);

                const texture = new THREE.CanvasTexture(canvas);
                const labelMaterial = new THREE.SpriteMaterial({ map: texture });
                const label = new THREE.Sprite(labelMaterial);
                label.position.set(bar.position.x, -1.5, 0);
                label.scale.set(2, 0.5, 1);
                scene.add(label);
            });

            // Add ground plane
            const groundGeometry = new THREE.PlaneGeometry(values.length * 2.5, 10);
            const groundMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.1;
            ground.receiveShadow = true;
            scene.add(ground);

        } else if (type === '3d-pie') {
            // 3D Pie Chart
            let currentAngle = 0;
            const radius = 4;
            const height = 1;

            values.forEach((value, index) => {
                const angle = (value / values.reduce((a, b) => a + b, 0)) * Math.PI * 2;

                const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, false, currentAngle, angle);
                const material = new THREE.MeshLambertMaterial({
                    color: colors[index % colors.length],
                    transparent: true,
                    opacity: 0.8
                });
                const slice = new THREE.Mesh(geometry, material);
                slice.castShadow = true;
                scene.add(slice);

                // Add label
                const labelAngle = currentAngle + angle / 2;
                const labelX = Math.cos(labelAngle) * (radius + 1.5);
                const labelZ = Math.sin(labelAngle) * (radius + 1.5);

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 256;
                canvas.height = 64;
                context.fillStyle = '#333';
                context.font = '20px Arial';
                context.textAlign = 'center';
                context.fillText(`${labels[index]}: ${value}`, 128, 40);

                const texture = new THREE.CanvasTexture(canvas);
                const labelMaterial = new THREE.SpriteMaterial({ map: texture });
                const label = new THREE.Sprite(labelMaterial);
                label.position.set(labelX, 1, labelZ);
                label.scale.set(3, 0.75, 1);
                scene.add(label);

                currentAngle += angle;
            });

        } else if (type === '3d-scatter') {
            // 3D Scatter Plot
            values.forEach((value, index) => {
                const geometry = new THREE.SphereGeometry(0.3, 16, 16);
                const material = new THREE.MeshLambertMaterial({
                    color: colors[index % colors.length],
                    transparent: true,
                    opacity: 0.8
                });
                const sphere = new THREE.Mesh(geometry, material);

                sphere.position.x = (index - values.length / 2) * 2;
                sphere.position.y = (value / maxValue) * 8;
                sphere.position.z = Math.random() * 4 - 2;
                sphere.castShadow = true;

                scene.add(sphere);

                // Connect to base with line
                const lineGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array([
                    sphere.position.x, 0, sphere.position.z,
                    sphere.position.x, sphere.position.y, sphere.position.z
                ]);
                lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: colors[index % colors.length],
                    opacity: 0.5,
                    transparent: true
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);
            });

            // Add ground grid
            const gridHelper = new THREE.GridHelper(values.length * 2, values.length);
            gridHelper.material.opacity = 0.2;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);
        }
    };

    return (
        <div
            ref={mountRef}
            style={{ width: '100%', height: '500px', cursor: 'grab' }}
            onMouseDown={(e) => e.target.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.target.style.cursor = 'grab'}
        />
    );
};

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
    const [exportFormat, setExportFormat] = useState('png');

    const chartRef = useRef(null);
    const chart3DRef = useRef(null);

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

    const downloadChart = () => {
        const safeTitle = (chartTitle || chartType).replace(/[^a-z0-9]/gi, ' ').toLowerCase();

        if (chartType.startsWith('3d-')) {
            // Handle 3D chart export
            if (!chart3DRef.current) {
                console.error('3D Chart renderer not found');
                return;
            }

            const canvas = chart3DRef.current.domElement;
            const imgData = canvas.toDataURL('image/png');

            if (exportFormat === 'png') {
                const link = document.createElement('a');
                link.download = `${safeTitle}_3d.png`;
                link.href = imgData;
                link.click();
            } else if (exportFormat === 'pdf') {
                const pdf = new jsPDF();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(imgData);
                const ratio = imgProps.width / imgProps.height;
                const pdfWidth = pageWidth * 0.9;
                const pdfHeight = pdfWidth / ratio;
                const x = (pageWidth - pdfWidth) / 2;
                const y = 20;

                pdf.text(chartTitle, x, 15);
                pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
                pdf.save(`${safeTitle}_3d.pdf`);
            }
        } else {
            // Handle 2D chart export (existing functionality)
            const chartInstance = chartRef.current;
            const canvas = chartInstance?.canvas;

            if (!canvas) {
                console.error('Canvas not found');
                return;
            }

            const imgData = canvas.toDataURL('image/png');

            if (exportFormat === 'png') {
                const link = document.createElement('a');
                link.download = `${safeTitle}.png`;
                link.href = imgData;
                link.click();
            } else if (exportFormat === 'pdf') {
                const pdf = new jsPDF();
                const pageWidth = pdf.internal.pageSize.getWidth();

                const imgProps = pdf.getImageProperties(imgData);
                const ratio = imgProps.width / imgProps.height;
                const pdfWidth = pageWidth * 0.9;
                const pdfHeight = pdfWidth / ratio;
                const x = (pageWidth - pdfWidth) / 2;
                const y = 20;

                pdf.text(chartTitle, x, 15);
                pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
                pdf.save(`${safeTitle}.pdf`);
            }
        }
    };

    const handleSaveAnalysis = async () => {
        const selectedFields = [];

        if (chartType === 'pie' || chartType === 'doughnut' || chartType === '3d-pie') {
            selectedFields.push(groupBy, yAxis);
        } else if (chartType === '3d-scatter') {
            // For now just use 3 fields (expand logic as needed)
            selectedFields.push(groupBy, xAxis, yAxis);
        } else {
            selectedFields.push(xAxis, yAxis);
        }

        const chartOptions = {
            title: chartTitle,
            aggregation,
            colorTheme: "default", // optional
        };

        try {
            const response = await fetch("http://localhost:5000/api/auth/saveAnalysis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                chartType,
                selectedFields,
                chartOptions,
                fileId,
            }),
            });

            if (!response.ok) {
            throw new Error("Failed to save analysis");
            }

            toast.success("Analysis saved successfully!");
        } catch (err) {
            toast.error("Error saving analysis.");
        }
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

    const is3DChart = chartType.startsWith('3d-');

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
                        Explore insights from your Excel files with interactive 2D & 3D visualizations.
                    </p>
                </motion.div>

                {!chartData ? (
                    <div className="flex justify-center">
                        <Lottie animationData={analyticsAnimation} className="h-96 w-96" />
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="w-full lg:w-1/4 backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg overflow-y-auto max-h-[90vh]">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Configure Chart</h2>
                            <div className="space-y-4">
                                <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Title</label>
                                <input value={chartTitle} onChange={e => setChartTitle(e.target.value)} placeholder="Chart Title"
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-sm" />

                                <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Chart Type</label>
                                <select value={chartType} onChange={e => setChartType(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                    <optgroup label="2D Charts">
                                        <option value="bar">📊 Bar</option>
                                        <option value="line">📈 Line</option>
                                        <option value="pie">🥧 Pie</option>
                                        <option value="doughnut">🍩 Doughnut</option>
                                        <option value="radar">📉 Radar</option>
                                        <option value="scatter">🔬 Scatter</option>
                                    </optgroup>
                                    <optgroup label="3D Charts">
                                        <option value="3d-bar">🏗️ 3D Bar</option>
                                        <option value="3d-pie">🎂 3D Pie</option>
                                        <option value="3d-scatter">🌌 3D Scatter</option>
                                    </optgroup>
                                </select>

                                {is3DChart && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            💡 <strong>3D Interaction:</strong> Click and drag to rotate the 3D chart
                                        </p>
                                    </div>
                                )}

                                <label className="block text-sm text-gray-600 dark:text-gray-300 mt-2">Select X-Axis</label>
                                <select value={xAxis} onChange={e => setXAxis(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600">
                                    {headers.map((h, i) => <option key={i}>{h}</option>)}
                                </select>

                                {chartType !== 'pie' && chartType !== '3d-pie' && (
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

                                <div className="flex space-x-2 items-center">
                                    <select
                                        value={exportFormat}
                                        onChange={(e) => setExportFormat(e.target.value)}
                                        className="px-3 py-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 text-sm"
                                    >
                                        <option value="png">Export as PNG</option>
                                        <option value="pdf">Export as PDF</option>
                                    </select>
                                    <button
                                        onClick={downloadChart}
                                        className="bg-indigo-600 text-white rounded-lg py-2 px-4 hover:bg-indigo-700"
                                    >
                                        <FiDownload className="inline mr-1" /> Export
                                    </button>
                                </div>
                                    <button
                                        onClick={handleSaveAnalysis}
                                        className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 mt-2"
                                        >
                                        💾 Save Analysis
                                    </button>

                                <button onClick={handleReset} className="w-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg py-2 hover:bg-gray-400 mt-2">
                                    <FiRefreshCw className="inline mr-1" /> Reset
                                </button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="w-full lg:w-3/4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                            <motion.div
                                key={chartType}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 min-h-[500px]"
                            >
                                {is3DChart ? (
                                    <>
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                            {chartTitle} (3D Interactive)
                                        </h3>
                                        <Chart3D
                                            data={generateChartData()}
                                            chartType={chartType}
                                            title={chartTitle}
                                            onRef={(renderer) => { chart3DRef.current = renderer; }}
                                        />
                                    </>
                                ) : (
                                    <Chart ref={chartRef} type={chartType} data={generateChartData()} options={chartOptions} />
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}