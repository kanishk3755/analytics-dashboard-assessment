import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import csvFilePath from "./Electric_Vehicle_Population_Data.csv";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("State");
  const [summary, setSummary] = useState({});

  useEffect(() => {
    // Fetch and parse the CSV file from the project directory
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsedData = result.data;
            setData(parsedData);
            setColumns(Object.keys(parsedData[0]));
            calculateSummary(parsedData);
          },
        });
      });
  }, []);

  const calculateSummary = (parsedData) => {
    const totalRecords = parsedData.length;

    // Most common make
    const makes = parsedData.map((row) => row["Make"]);
    const mostCommonMake = makes
      .filter(Boolean)
      .reduce((acc, make) => {
        acc[make] = (acc[make] || 0) + 1;
        return acc;
      }, {});

    const topMake = Object.keys(mostCommonMake).reduce((a, b) =>
      mostCommonMake[a] > mostCommonMake[b] ? a : b
    );

    // Average electric range
    const electricRanges = parsedData
      .map((row) => parseInt(row["Electric Range"], 10))
      .filter((range) => !isNaN(range));

    const averageRange = (
      electricRanges.reduce((sum, range) => sum + range, 0) / electricRanges.length
    ).toFixed(2);

    setSummary({
      totalRecords,
      topMake,
      averageRange,
    });
  };

  const generateChartData = () => {
    const chartLabels = [...new Set(data.map((row) => row[selectedColumn]))];
    const chartValues = chartLabels.map(
      (label) =>
        data.filter((row) => row[selectedColumn] === label).length
    );

    return {
      labels: chartLabels,
      datasets: [
        {
          label: `Distribution by ${selectedColumn}`,
          data: chartValues,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: true,
        },
      ],
    };
  };

  return (
    <div className="App">
      <h1>Electric Vehicle Data Visualizer</h1>

      {/* Summary Section */}
      <div className="summary">
        <h2>Summary</h2>
        <p><b>Total Records:</b> {summary.totalRecords}</p>
        <p><b>Most Common Make:</b> {summary.topMake}</p>
        <p><b>Average Electric Range:</b> {summary.averageRange} miles</p>
      </div>

      {/* Column Selector */}
      {columns.length > 0 && (
        <div className="column-selector">
          <h3>Select Column for Analysis</h3>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            {columns.map((column, index) => (
              <option key={index} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chart Visualization */}
      {data.length > 0 && (
        <div className="charts">
          <h2>Chart</h2>
          <Line data={generateChartData()} />
        </div>
      )}
    </div>
  );
}

export default App;
