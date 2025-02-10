import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarChart from './BarChart';
import './TransactionDashboard.css';
import PieChart from './PieChart';

const TransactionDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const [month, setMonth] = useState('3'); // Default select month

  useEffect(() => {
    fetchTransactions();
  }, [page, searchQuery, month]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/transactions', {
        params: {
          search: searchQuery,
          page: page,
          perPage: perPage,
          month: month,
        },
      });
      // console.log(response);
      setTransactions(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const [statistics, setStatistics] = useState({
    totalSale: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0
  });

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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        
        await axios.get(`http://localhost:8080/statistics?month=${month}`).then((res)=>{
          // console.log(res.data);
          setStatistics(res.data);
        });;
        // console.log(response);
        // setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, [month]);
  
  return (
    <div className="main-dashboard">
      <h1 className="title">
        Transaction 
        <div>
          Dashboard
        </div>
      </h1>
      <div className='transaction-dashboard-table'>
        <div className="user-controls">
          <select id='month' value={month} onChange={handleMonthChange}>
            <option value="1">Jan</option>
            <option value="2">Feb</option>
            <option value="3">March</option>
            <option value="4">Apr</option>
            <option value="5">May</option>
            <option value="6">Jun</option>
            <option value="7">July</option>
            <option value="8">Aug</option>
            <option value="9">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>

          </select>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sold</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold ? 'Yes' : 'No'}</td>
                <td>
                  <img src={transaction.image} alt={transaction.title} width="50" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span  className='pageno'>Page No: {page}</span>
          <div className='btn'>
            <button onClick={goToPreviousPage} disabled={page === 1}>
              Previous
            </button>
            <button onClick={goToNextPage} disabled={page === totalPages}>
              Next 
            </button>
          </div>
          <span className='perpage'>Per Page: {perPage}</span>
        </div>
      </div>
    
 {/* Statistics of selected month    */}

      <div className='statistics-card'>
        <h2>Statistics - {monthData[month]}</h2>
        <span>(Selected month name from dropdown)</span>
        <div className="statistics-box">
          <div>Total sale: <span>{statistics.totalSaleAmount}</span></div>
          <div>Total sold items: <span>{statistics.totalSoldItems}</span></div>
          <div>Total not sold items: <span>{statistics.totalNotSoldItems}</span></div>
        </div>
      </div>


{/* Charts - BarChart and PieChart */}

      <div style={{display: "flex", alignContent: 'center', justifyContent: "center"}}>
        <BarChart id="barchartid" month={month}/>
        <PieChart id="piechartid" month={month}/>
      </div>
    </div>
  );
};

export default TransactionDashboard;
