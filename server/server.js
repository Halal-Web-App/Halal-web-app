require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const restaurantRoutes = require('./routes/restaurants');
const halalRoutes = require('./routes/halal');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/halal', halalRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Halal Restaurant API running on port ${port}`);
});
