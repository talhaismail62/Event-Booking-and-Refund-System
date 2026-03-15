const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db'); 

const logger = require('./middleware/logger');
const hallRoutes = require('./routes/hallroutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/v1/halls', hallRoutes);

const authRoutes = require('./routes/authroutes');

app.use('/api/v1/auth', authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});