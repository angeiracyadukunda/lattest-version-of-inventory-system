const express = require('express');
const router = express.Router();
// const requestController = require('./RequestController');
const { notifyFinanceManager } = require('../services/notificationService');
const Request = require('../models/requestModel');

// Create a new product request
router.post('/requests', async (req, res) => {
    try {
        const request = await Request.create(req.body);

        // Send the request to the Finance Manager
        notifyFinanceManager(request);

        res.status(201).json({ request, message: 'Request successfully created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
