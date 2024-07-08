const dotenv = require('dotenv')

dotenv.config();

const { URI, PORT } = process.env;

module.exports = { URI, PORT };