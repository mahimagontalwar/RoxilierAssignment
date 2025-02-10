const axios = require('axios');
const Product = require('./models/Products');
const database = require("./config/database");
const mongoose = require('mongoose');

const seedDB = async (req, res) => {
    try {
      database.connect();

      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const products = response.data;
  
      await Product.deleteMany();
  
      await Product.insertMany(products);
  
      console.log('Database initialized with seed data');
    } catch (error) {
      console.error('Error seeding data:', error);
      console.log('Failed to seed data');
    }
    finally{
        mongoose.connection.close();
    }
};

seedDB();