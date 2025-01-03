const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 5000;

const API_URL = 'https://sandbox-merchant.revolut.com/api/orders';
const API_KEY = 'sk_Tg7ivAtnBKkzgVpJtumFmBLYooKpJnrS3fnOcYGJfQ3Is6E_ZuyTy5VboazGdGm8'; 

// Enable CORS for all origins
app.use(cors({
    origin: ['http://localhost:3000', 'https://card-popup-hometask.vercel.app'], 
    methods: ['GET', 'POST', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // Allowing these headers in requests to process requests
}));

// Middleware to handle JSON requests
app.use(express.json());

app.options('*', cors());

// Create an order API endpoint
app.post('/api/create-order', async (req, res) => {
    const { amount, currency } = req.body;

    console.log('Received Order Data:', req.body);

    const data = JSON.stringify({
        amount: amount,
        currency: currency
    });

    console.log('Request Data for Revolut API:', data);

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: API_URL,
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json',
            'Revolut-Api-Version': '2024-09-01', 
            'Authorization': `Bearer ${API_KEY}` 
        },
        data: data
    };

    try {
        console.log('Sending request with config:', config);
        const response = await axios(config);
        console.log(' Create Order API Response:', response.data);

        // sending back the token received from Revolut API to FE
        res.json({
            token: response.data.token,  
            checkoutUrl: response.data.checkout_url 
        });
    } catch (error) {
        console.error('Error creating order:', error);

        console.error('Error Details:', error.response ? error.response.data : error.message);

        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
