/**
 * Auric Order Email Server
 * 
 * Express server that handles order email notifications using Nodemailer
 * Replaces the EmailJS implementation with a more robust server-side solution
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailService = require('./email/service');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(express.json());
app.use(cors());

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Auric Order Email Service',
    status: 'running'
  });
});

/**
 * Send order confirmation emails
 * Sends emails to both the customer and store owner
 */
app.post('/api/send-order-email', async (req, res) => {
  try {
    // Get order data from request body
    const orderData = req.body;
    
    // Validate required data
    if (!orderData || !orderData.customer || !orderData.products) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data'
      });
    }
    
    console.log('Received order email request for:', orderData.orderReference);
    
    // Send emails
    const result = await emailService.sendOrderEmails(orderData);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Order emails sent successfully',
        result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send order emails',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in send-order-email endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending order emails',
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 * Used to verify server is running properly
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ✅ Auric Order Email Server running on port ${PORT}
  📧 Ready to send order confirmation emails
  🔒 Using secure Nodemailer transport
  
  Available Routes:
  - GET  / : Service information
  - POST /api/send-order-email : Send order confirmation emails
  - GET  /health : Health check endpoint
  `);
});