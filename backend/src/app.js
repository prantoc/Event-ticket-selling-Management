const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./app/routes');
const notFound = require('./app/middleware/notFound');
const globalErrorHandler = require('./app/middleware/globalErrorHandler');
app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the API',
    });
});

app.use(globalErrorHandler);
app.use(notFound);
module.exports = app;