const express = require("express");
const database = require("./config/database");
const dotenv = require("dotenv");
const Product = require("./models/Products");
const { default: axios } = require("axios");
const cors = require("cors");

const app = express();

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

app.use(cors());

//def route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is up and running....'
    });
});

//Get all Transactions and also search the product 
app.get('/transactions', async (req, res) => {
    try {
        const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
        const month = parseInt(req.query.month); 
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        if (month && (isNaN(month) || month < 1 || month > 12)) {
            return res.status(400).json({
                message: "Please provide a valid month as an integer (1-12)."
            });
        }

        const allProducts = await Product.find();

        let filteredItems = allProducts.filter(product => {
            const matchesSearch = searchQuery ? (
                product.title.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery) ||
                product.price.toString().includes(searchQuery)
            ) : true;

            const matchesMonth = month ? (
                new Date(product.dateOfSale).getMonth() + 1 === month
            ) : true;

            return matchesSearch && matchesMonth;
        });

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        res.status(200).json({
            filteredItems,
            page,
            perPage,
            totalItems: filteredItems.length,
            totalPages: Math.ceil(filteredItems.length / perPage),
            items: paginatedItems,
        });
    } catch (error) {
        console.error('Error while fetching transactions:', error);
        res.status(500).json({
            message: 'Failed to fetch transactions',
        });
    }
});


app.get('/statistics', async (req, res) => {
    try {
        const month = parseInt(req.query.month);
    
        if (!month) {
            return res.status(400).json({
                message: "Please provide month"
            });
        }

        const products = await Product.find({});

        const productsInMonth = products.filter(product => {
            const saleDate = new Date(product.dateOfSale);
            return saleDate.getMonth() + 1 === month; 
        });

        let totalSaleAmount = 0;
        let totalSoldItems = 0;
        let totalNotSoldItems = 0;

        productsInMonth.forEach(product => {
            if (product.sold) {
                totalSoldItems++;
                totalSaleAmount += product.price;
            } else {
                totalNotSoldItems++;
            }
        });
    
        res.status(200).json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            message: "Error fetching statistics."
        });
    }
});


app.get('/barchart', async (req, res) => {
    try {
        const month = parseInt(req.query.month);

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                message: "Please provide a valid month"
            });
        }

        const products = await Product.find({});

        const priceRanges = {
            "0-100": 0,
            "101-200": 0,
            "201-300": 0,
            "301-400": 0,
            "401-500": 0,
            "501-600": 0,
            "601-700": 0,
            "701-800": 0,
            "801-900": 0,
            "901-above": 0
        };

        products.forEach(product => {

            const saleDate = new Date(product.dateOfSale);
            const saleMonth = saleDate.getMonth() + 1;

            if (saleMonth === month) {
                const price = product.price;

                if (price <= 100) {
                    priceRanges["0-100"]++;
                } else if (price <= 200) {
                    priceRanges["101-200"]++;
                } else if (price <= 300) {
                    priceRanges["201-300"]++;
                } else if (price <= 400) {
                    priceRanges["301-400"]++;
                } else if (price <= 500) {
                    priceRanges["401-500"]++;
                } else if (price <= 600) {
                    priceRanges["501-600"]++;
                } else if (price <= 700) {
                    priceRanges["601-700"]++;
                } else if (price <= 800) {
                    priceRanges["701-800"]++;
                } else if (price <= 900) {
                    priceRanges["801-900"]++;
                } else {
                    priceRanges["901-above"]++;
                }
            }
        });

        res.status(200).json({
            month,
            priceRanges
        });

    }
    catch (error) {
        console.error('Error while generating bar chart : ', error);
        res.status(500).json({
            message: "Error generating bar chart data"
        });
    }
});

app.get('/piechart', async (req, res) => {
    try {
        const month = parseInt(req.query.month);

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                message: "Please provide a valid month"
            })
        }

        const products = await Product.find({});

        const categoryCount = {};

        products.forEach(product => {
            const saleDate = new Date(product.dateOfSale);

            const saleMonth = saleDate.getMonth() + 1;

            if (saleMonth == month) {
                const category = product.category;

                if (categoryCount[category]) {
                    categoryCount[category]++;
                }
                else {
                    categoryCount[category] = 1;
                }
            }
        });

        res.status(200).json({
            month,
            categoryCount
        });
    }
    catch (error) {
        console.log("Error while generating the pie chart : ", error);
        res.status(500).json({
            message: "Error generating pie chart data"
        })
    }
});

app.get('/combined', async (req, res) => {
    try {
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);

        let data = {
            stats: [],
            barChart: [],
            pieChart: []
        }

        await axios.get(`http://localhost:${process.env.PORT}/statistics?month=${month}&year=${year}`).then((res) => {
            data = { ...data, stats: res.data };
        });
        await axios.get(`http://localhost:${process.env.PORT}/barchart?month=${month}`).then((res) => {
            data = { ...data, barChart: res.data };
        });
        await axios.get(`http://localhost:${process.env.PORT}/piechart?month=${month}`).then((res) => {
            data = { ...data, pieChart: res.data };
        });

        res.status(200).json({
            data
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error generating Combined data"
        })
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`)
})
