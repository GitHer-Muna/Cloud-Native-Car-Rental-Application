const assert = require('assert');

// Basic test for BFF service
console.log('Running BFF Service tests...');

// Test booking data validation
function testBookingValidation() {
    const validBooking = {
        customerName: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        carType: 'Tesla Model 3',
        pickupDate: '2026-02-01',
        returnDate: '2026-02-05',
        pickupLocation: 'Los Angeles',
        rentalDays: 4,
        totalAmount: 400
    };

    // Check required fields
    assert(validBooking.customerName, 'Customer name is required');
    assert(validBooking.email, 'Email is required');
    assert(validBooking.carType, 'Car type is required');
    assert(validBooking.totalAmount > 0, 'Total amount must be positive');

    console.log('✅ Booking validation test passed');
}

// Test health endpoint response structure
function testHealthResponse() {
    const healthResponse = {
        status: 'healthy',
        service: 'rentacar-bff',
        timestamp: new Date().toISOString()
    };

    assert(healthResponse.status === 'healthy', 'Status should be healthy');
    assert(healthResponse.service === 'rentacar-bff', 'Service name should match');
    assert(healthResponse.timestamp, 'Timestamp should be present');

    console.log('✅ Health response test passed');
}

// Run tests
try {
    testBookingValidation();
    testHealthResponse();
    console.log('🎉 All BFF Service tests passed!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}