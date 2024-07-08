const express = require('express');
const axios = require('axios');
const Product = require('../models/product');

const router = express.Router();

// Initialize database from given API
router.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        await Product.deleteMany({});

        await Product.insertMany(products);

        res.status(200).send('Database initialized successfully');
    } catch (error) {
        res.status(500).send('Error initializing database: ' + error.message);
    }
});


// Helper function to get month from date
const getMonthFromDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('default', { month: 'long' });
};


// list all transactions from a month
router.get('/list', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).send('Month is required');
        }

        const products = await Product.find({});
        const filteredProducts = products.filter(product => getMonthFromDate(product.dateOfSale) === month);

        res.status(200).json(filteredProducts);
    } catch (error) {
        res.status(500).send('Error fetching transactions: ' + error.message);
    }
});


// search and paginate transactions
router.get('/search', async (req, res) => {
    try {
        const { month, search, page = 1, perPage = 10 } = req.query;

        if (!month) {
            return res.status(400).send('Month is required');
        }

        let query = {};

        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const products = await Product.find(query);
        const filteredProducts = products.filter(product => getMonthFromDate(product.dateOfSale) === month);

        const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

        res.status(200).json({
            page: parseInt(page),
            perPage: parseInt(perPage),
            total: filteredProducts.length,
            products: paginatedProducts
        });
    } catch (error) {
        res.status(500).send('Error searching transactions: ' + error.message);
    }
});

// statastics
router.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).send('Month is required');
        }

        const products = await Product.find({});
        const filteredProducts = products.filter(product => getMonthFromDate(product.dateOfSale) === month);

        const totalSaleAmount = filteredProducts.reduce((total, product) => {
            return product.sold ? total + product.price : total;
        }, 0);

        const totalSoldItems = filteredProducts.filter(product => product.sold).length;
        const totalNotSoldItems = filteredProducts.filter(product => !product.sold).length;

        res.status(200).json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        res.status(500).send('Error fetching statistics: ' + error.message);
    }
});

// bar chart data for a given month
router.get('/barchart', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).send('Month is required');
        }

        const products = await Product.find({});
        const filteredProducts = products.filter(product => getMonthFromDate(product.dateOfSale) === month);

        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0,
        };

        filteredProducts.forEach(product => {
            const price = product.price;
            if (price <= 100) {
                priceRanges['0-100']++;
            } else if (price <= 200) {
                priceRanges['101-200']++;
            } else if (price <= 300) {
                priceRanges['201-300']++;
            } else if (price <= 400) {
                priceRanges['301-400']++;
            } else if (price <= 500) {
                priceRanges['401-500']++;
            } else if (price <= 600) {
                priceRanges['501-600']++;
            } else if (price <= 700) {
                priceRanges['601-700']++;
            } else if (price <= 800) {
                priceRanges['701-800']++;
            } else if (price <= 900) {
                priceRanges['801-900']++;
            } else {
                priceRanges['901-above']++;
            }
        });

        res.status(200).json(priceRanges);
    } catch (error) {
        res.status(500).send('Error fetching bar chart data: ' + error.message);
    }
});


// piechart data for given month
router.get('/piechart', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).send('Month is required');
        }

        const products = await Product.find({});
        const filteredProducts = products.filter(product => getMonthFromDate(product.dateOfSale) === month);

        const categoryCounts = filteredProducts.reduce((acc, product) => {
            if (acc[product.category]) {
                acc[product.category]++;
            } else {
                acc[product.category] = 1;
            }
            return acc;
        }, {});

        res.status(200).json(categoryCounts);
    } catch (error) {
        res.status(500).send('Error fetching pie chart data: ' + error.message);
    }
});


// combined api
router.get('/combinedapi', async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).send('Month is required');
        }

        const [listResponse, barChartResponse, pieChartResponse] = await Promise.all([
            axios.get(`http://localhost:5005/api/products/list?month=${month}`),
            axios.get(`http://localhost:5005/api/products/barchart?month=${month}`),
            axios.get(`http://localhost:5005/api/products/piechart?month=${month}`)
        ]);

        const combinedResponse = {
            transactions: listResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data
        };

        res.status(200).json(combinedResponse);
    } catch (error) {
        res.status(500).send('Error fetching combined data: ' + error.message);
    }
});


module.exports = router;