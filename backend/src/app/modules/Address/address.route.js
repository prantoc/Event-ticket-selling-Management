const express = require('express');
const router = express.Router();
const controller = require('./address.controller');

// Load all data in one go (bulk insert)
router.post('/bulk', controller.loadBulkData);

// Get all countries
router.get('/', controller.getAll);

// Add a new state to a country
router.post('/add-state', controller.addState);

// Add a new city to a state
router.post('/add-city', controller.addCity);

// Update a city's name
router.put('/update-city', controller.updateCity);

module.exports = router;
