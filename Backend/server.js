const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userroutes = require('./routes/userroutes');
const hallroutes = require('./routes/hallroutes');
const menuroutes = require('./routes/menuroutes');
const bookingroutes = require('./routes/bookingroutes');
const refundroutes = require('./routes/refundroutes');
const invoiceroutes = require('./routes/invoiceroutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/users', userroutes); 
app.use('/api/v1/halls', hallroutes);
app.use('/api/v1/menu', menuroutes);
app.use('/api/v1/bookings', bookingroutes);
app.use('/api/v1/refunds', refundroutes);
app.use('/api/v1/invoices', invoiceroutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});