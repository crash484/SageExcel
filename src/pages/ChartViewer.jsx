import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../store/authSlice';
import * as XLSX from 'xlsx';

const ChartViewer = () => {
  const token = useSelector(selectCurrentToken);
  const { chartId } = useParams();
  const [chartData, setChartData] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/analysis/${chartId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setChartData(data);
          fetchFileAndExtractData(data.fileId, data.selectedFields);
        } else {
          setError(data.message || 'Failed to load chart');
        }
      } catch (err) {
        console.error(err);
        setError('Server error while loading chart');
      }
    };

    const fetchFileAndExtractData = async (fileId, selectedFields) => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/preview/${fileId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        const filtered = json.map(row => ({
          [selectedFields[0]]: row[selectedFields[0]],
          [selectedFields[1]]: row[selectedFields[1]]
        }));
        setDataPoints(filtered);
      } catch (err) {
        console.error(err);
        setError('Failed to load file data');
      }
    };

    fetchChart();
  }, [token, chartId]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!chartData || dataPoints.length === 0) return <div>Loading...</div>;

  const { chartType, chartOptions, selectedFields } = chartData;

  const chartConfig = {
    labels: dataPoints.map(dp => dp[selectedFields[0]]),
    datasets: [{
      label: selectedFields[1],
      data: dataPoints.map(dp => dp[selectedFields[1]]),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
    }],
  };

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie
  }[chartType] || Bar;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{chartOptions?.title || 'Saved Chart'}</h2>
      <ChartComponent data={chartConfig} />
    </div>
  );
};

export default ChartViewer;