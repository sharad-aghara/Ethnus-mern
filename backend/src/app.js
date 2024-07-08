const express = require('express');
const mongoose = require('mongoose');
const productsRoute = require('./routes/products');
const { URI, PORT } = require('./config/index');

const app = express();

// Middleware
app.use(express.json());


// Enable CORS
// app
//     .use(cors({
//         origin: true,
//         credentials: true
//     }));


// Connetion
mongoose
    .connect(URI)
    .then(console.log("Connected to database"))
    .catch((err) => console.log(err));



// Use the routes
app.use('/api/products', productsRoute);


// start up server
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);