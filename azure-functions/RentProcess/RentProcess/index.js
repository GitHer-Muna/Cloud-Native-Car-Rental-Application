const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, rentQueueItem) {
    context.log('RentProcess function triggered');
    
    try {
        const bookingData = typeof rentQueueItem === 'string' 
            ? JSON.parse(rentQueueItem) 
            : rentQueueItem;

        context.log('Processing booking:', bookingData.bookingId);

        const rentRecord = {
            id: bookingData.bookingId,
            customerName: bookingData.customerName,
            email: bookingData.email,
            phone: bookingData.phone,
            carType: bookingData.carType,
            pickupDate: bookingData.pickupDate,
            returnDate: bookingData.returnDate,
            pickupLocation: bookingData.pickupLocation,
            rentalDays: bookingData.rentalDays,
            totalAmount: bookingData.totalAmount,
            status: 'confirmed',
            processedAt: new Date().toISOString(),
            bookingDate: bookingData.bookingDate
        };

        if (process.env.COSMOS_DB_CONNECTION_STRING) {
            try {
                const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
                const database = client.database('RentACarDB');
                const container = database.container('Rentals');
                
                await container.items.create(rentRecord);
                context.log('Rental record saved to Cosmos DB');
            } catch (dbError) {
                context.log('Cosmos DB not available, continuing without persistence');
            }
        } else {
            context.log('Rental record (local):', JSON.stringify(rentRecord, null, 2));
        }

        const paymentData = {
            bookingId: bookingData.bookingId,
            customerName: bookingData.customerName,
            email: bookingData.email,
            amount: bookingData.totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        context.bindings.paymentQueueItem = paymentData;
        context.log('Payment request queued for booking:', bookingData.bookingId);

        context.log('Rent processing completed successfully');

    } catch (error) {
        context.log.error('Error processing rental:', error);
        throw error;
    }
};
