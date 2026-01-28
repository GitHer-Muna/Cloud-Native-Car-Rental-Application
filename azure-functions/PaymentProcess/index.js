const { CosmosClient } = require('@azure/cosmos');
const sgMail = require('@sendgrid/mail');

module.exports = async function (context, paymentQueueItem) {
    context.log('PaymentProcess function triggered');
    
    try {
        const paymentData = typeof paymentQueueItem === 'string' 
            ? JSON.parse(paymentQueueItem) 
            : paymentQueueItem;

        context.log('Processing payment for booking:', paymentData.bookingId);

        const paymentRecord = {
            id: `payment-${paymentData.bookingId}`,
            bookingId: paymentData.bookingId,
            customerName: paymentData.customerName,
            email: paymentData.email,
            amount: paymentData.amount,
            status: 'completed',
            paymentMethod: 'credit_card',
            transactionId: `TXN-${Date.now()}`,
            processedAt: new Date().toISOString()
        };

        if (process.env.COSMOS_DB_CONNECTION_STRING) {
            try {
                const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
                const database = client.database('RentACarDB');
                const container = database.container('Payments');
                
                await container.items.create(paymentRecord);
                context.log('Payment record saved to Cosmos DB');
            } catch (dbError) {
                context.log('Cosmos DB not available, continuing without persistence');
            }
        } else {
            context.log('Payment record (local):', JSON.stringify(paymentRecord, null, 2));
        }

        const emailContent = {
            to: paymentData.email,
            from: process.env.NOTIFICATION_EMAIL || 'notifications@rentacar.com',
            subject: 'Booking Confirmation - RentACar',
            text: `Dear ${paymentData.customerName},\n\nYour booking has been confirmed!\n\nBooking ID: ${paymentData.bookingId}\nAmount Paid: $${paymentData.amount}\nTransaction ID: ${paymentRecord.transactionId}\n\nThank you for choosing RentACar!\n\nBest regards,\nRentACar Team`,
            html: `
                <h2>Booking Confirmation</h2>
                <p>Dear ${paymentData.customerName},</p>
                <p>Your booking has been confirmed!</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${paymentData.bookingId}</li>
                    <li><strong>Amount Paid:</strong> $${paymentData.amount}</li>
                    <li><strong>Transaction ID:</strong> ${paymentRecord.transactionId}</li>
                </ul>
                <p>Thank you for choosing RentACar!</p>
                <p>Best regards,<br>RentACar Team</p>
            `
        };

        if (process.env.SENDGRID_API_KEY) {
            try {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                await sgMail.send(emailContent);
                context.log('Email sent successfully to:', paymentData.email);
            } catch (emailError) {
                context.log('Email service not configured, email not sent');
            }
        } else {
            context.log('Email content (local):', JSON.stringify(emailContent, null, 2));
        }

        const notificationData = {
            bookingId: paymentData.bookingId,
            email: paymentData.email,
            type: 'booking_confirmation',
            status: 'sent',
            sentAt: new Date().toISOString()
        };

        context.bindings.notificationQueueItem = notificationData;
        context.log('Notification queued for booking:', paymentData.bookingId);

        context.log('Payment processing completed successfully');

    } catch (error) {
        context.log.error('Error processing payment:', error);
        throw error;
    }
};
