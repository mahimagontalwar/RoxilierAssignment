import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import "./chart.css";

import {
    Chart as ChartJS,
    ArcElement, 
  } from 'chart.js';

  ChartJS.register( ArcElement);

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

const PieChart = ({ month }) => {
  
    const [pieData, setPieData] = useState(null);
  
    useEffect(() => {
    
      if(month){
        axios.get(`http://localhost:8080/piechart?month=${month}`) 
            .then(response => {
                const categories = response.data.categoryCount;
                // console.log(categories)
                let colorArr = [];
                // console.log("Length: ", Object.keys(categories).length)
                for(let i=0; i<Object.keys(categories).length; i++){
                    colorArr.push('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'));
                }
                setPieData({
                    labels: Object.keys(categories),
                    datasets: [
                        {
                            label: 'Number of Items',
                            data: Object.values(categories),
                            backgroundColor: colorArr
                        }
                    ]
                });
            })
            .catch(error => {
                console.error("Error fetching pie chart data:", error);
            });
      }
    }, [month]);
  
    return pieData ? (
      <div> 
        
          <div className="pie-style">
            <h2>Pie Chart - {monthData[month]}</h2>
              <Pie data={pieData}/>
          </div>
        
      </div>
    ) : (
      <p>Loading chart...</p>
    );
  };
  
  export default PieChart;