import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "./chart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const monthData = {
  '1': "Jan",
  '2': "Feb",
  '3': "March",
  '4': "Apr",
  '5': "May",
  '6': "Jun",
  '7': "July",
  "8": "Aug",
  "9": "Sept",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec"
}

const BarChart = ({ month }) => {

  const [chartData, setChartData] = useState(null);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
  };


  useEffect(() => {
    console.log(month);
    if (month) {
      axios
        .get(`http://localhost:8080/barchart?month=${month}`)
        .then((response) => {
          const data = response.data.priceRanges;
          // console.log("Bar Chart Data: ", data);

          let colorArr = [];
          // console.log("Length: ", Object.keys(data).length)
          for (let i = 0; i < Object.keys(data).length; i++) {
            colorArr.push('#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'));
          }

          setChartData({
            labels: Object.keys(data),
            datasets: [
              {
                label: `Price Range Stats for Month - ${monthData[month]}`,
                data: Object.values(data),
                backgroundColor: colorArr,
              },
            ],
          });
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
        });
    }
  }, [month]);

  return chartData ? (
    <div>
      <div className="bar-style">
        <h2>Bar Chart Stats - {monthData[month]}</h2>
        <Bar data={chartData} options={options} />
      </div>

    </div>
  ) : (
    <p>Loading chart...</p>
  );
};

export default BarChart;
