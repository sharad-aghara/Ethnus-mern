# MERN Project README

Create a .env file in the root directory with the following variables:
```
PORT=5005
MONGODB_URI=<your-mongodb-uri>
```

Run Server
```
npm run dev
```

Initialize database
```
http://localhost:5005/api/products/initialize
```

List Transactions
```
http://localhost:5005/api/products/list?month=<month>
```

Search and Paginate Transactions
```
http://localhost:5005/api/products/search?month=<month>&search=<search-term>
```

Statistics
```
http://localhost:5005/api/products/statistics?month=<month>
```

Bar Chart Data
```
http://localhost:5005/api/products/barchart?month=<month>
```

Pie Chart Data
```
http://localhost:5005/api/products/piechart?month=<month>
```

Combined Data
```
http://localhost:5005/api/products/combinedapi?month=<month>
```