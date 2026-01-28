// Dynamic API URL - use localhost for local development, cloud URL for production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://carrental-bff.azurewebsites.net/api';

document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        customerName: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        carType: document.getElementById('carType').value,
        pickupDate: document.getElementById('pickupDate').value,
        returnDate: document.getElementById('returnDate').value,
        pickupLocation: document.getElementById('pickupLocation').value
    };

    const carPrices = {
        economy: 30,
        comfort: 50,
        luxury: 100,
        suv: 80
    };

    const pickupDate = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
    const totalAmount = days * carPrices[formData.carType];

    const bookingData = {
        ...formData,
        rentalDays: days,
        totalAmount: totalAmount,
        bookingDate: new Date().toISOString()
    };

    showStatus('Processing your booking...', 'processing');

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
            showStatus(
                `Booking successful! Booking ID: ${result.bookingId}. Total Amount: $${totalAmount}. You will receive a confirmation email shortly.`,
                'success'
            );
            document.getElementById('bookingForm').reset();
        } else {
            showStatus('Booking failed: ' + (result.message || 'Please try again.'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Unable to connect to the server. Please ensure the backend is running.', 'error');
    }
});

function showStatus(message, type) {
    const statusSection = document.getElementById('statusSection');
    const statusMessage = document.getElementById('statusMessage');
    
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusSection.style.display = 'block';
    
    statusSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const today = new Date().toISOString().split('T')[0];
document.getElementById('pickupDate').setAttribute('min', today);
document.getElementById('returnDate').setAttribute('min', today);

document.getElementById('pickupDate').addEventListener('change', function() {
    const pickupDate = this.value;
    document.getElementById('returnDate').setAttribute('min', pickupDate);
});
