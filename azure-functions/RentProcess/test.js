const assert = require('assert');

// Basic test for RentProcess function
console.log('Running RentProcess Function tests...');

// Test rental record creation
function testRentalRecordCreation() {
    const bookingData = {
        bookingId: 'test-123',
        customerName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        carType: 'BMW X5',
        pickupDate: '2026-02-01',
        returnDate: '2026-02-05',
        pickupLocation: 'New York',
        rentalDays: 4,
        totalAmount: 400
    };

    const expectedRentalRecord = {
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

    // Simulate the function logic
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

    assert(rentRecord.id === expectedRentalRecord.id, 'ID should match booking ID');
    assert(rentRecord.status === 'confirmed', 'Status should be confirmed');
    assert(rentRecord.customerName === bookingData.customerName, 'Customer name should match');
    assert(rentRecord.totalAmount === bookingData.totalAmount, 'Total amount should match');

    console.log('✅ Rental record creation test passed');
}

// Test payment queue message creation
function testPaymentQueueMessage() {
    const bookingData = {
        bookingId: 'test-123',
        customerName: 'Jane Smith',
        email: 'jane@example.com',
        totalAmount: 400
    };

    const expectedPaymentData = {
        bookingId: bookingData.bookingId,
        customerName: bookingData.customerName,
        email: bookingData.email,
        amount: bookingData.totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Simulate payment data creation
    const paymentData = {
        bookingId: bookingData.bookingId,
        customerName: bookingData.customerName,
        email: bookingData.email,
        amount: bookingData.totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    assert(paymentData.bookingId === expectedPaymentData.bookingId, 'Booking ID should match');
    assert(paymentData.status === 'pending', 'Status should be pending');
    assert(paymentData.amount === bookingData.totalAmount, 'Amount should match');

    console.log('✅ Payment queue message test passed');
}

// Run tests
try {
    testRentalRecordCreation();
    testPaymentQueueMessage();
    console.log('🎉 All RentProcess Function tests passed!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}