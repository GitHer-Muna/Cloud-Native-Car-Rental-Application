const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { QueueClient } = require('@azure/storage-queue');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let rentQueue;
let paymentQueue;

if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    try {
        rentQueue = new QueueClient(
            process.env.AZURE_STORAGE_CONNECTION_STRING,
            'rent-queue'
        );
        paymentQueue = new QueueClient(
            process.env.AZURE_STORAGE_CONNECTION_STRING,
            'payment-queue'
        );
        console.log('Azure Queue clients initialized');
    } catch (error) {
        console.log('Running without Azure Storage Queue:', error.message);
    }
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'rentacar-bff',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/bookings', async (req, res) => {
    try {
        const bookingId = uuidv4();
        const bookingData = {
            bookingId,
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log('New booking received:', bookingId);

        if (rentQueue) {
            await rentQueue.sendMessage(Buffer.from(JSON.stringify(bookingData)).toString('base64'));
            console.log('Booking sent to rent-queue');
        } else {
            console.log('Local mode: Simulating rent processing');
        }

        res.status(201).json({
            success: true,
            bookingId,
            message: 'Booking created successfully',
            status: 'processing'
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
});

app.get('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    
    res.json({
        bookingId: id,
        status: 'processing',
        message: 'Booking is being processed'
    });
});

app.post('/api/payments', async (req, res) => {
    try {
        const paymentId = uuidv4();
        const paymentData = {
            paymentId,
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log('Payment initiated:', paymentId);

        if (paymentQueue) {
            await paymentQueue.sendMessage(Buffer.from(JSON.stringify(paymentData)).toString('base64'));
            console.log('Payment sent to payment-queue');
        } else {
            console.log('Local mode: Simulating payment processing');
        }

        res.status(201).json({
            success: true,
            paymentId,
            message: 'Payment processing initiated'
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment'
        });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`BFF Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
