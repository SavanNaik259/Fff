/**
 * Firebase Cloud Functions for Auric Jewelry
 * 
 * This file provides serverless functions to replace the Express server:
 * 1. Email sending functionality for order confirmations
 * 2. Razorpay payment integration
 * 3. Health check endpoint
 */

const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

// Import email service
const emailService = require('./email/service');

/**
 * Send order confirmation emails
 * Sends emails to both the customer and store owner
 */
exports.sendOrderEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
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
      console.error('Error in sendOrderEmail function:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while sending order emails',
        error: error.message
      });
    }
  });
});

/**
 * Create a Razorpay order
 */
exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Import Razorpay
      const Razorpay = require('razorpay');
      
      // Create a Razorpay instance
      const razorpay = new Razorpay({
        key_id: functions.config().razorpay?.key_id,
        key_secret: functions.config().razorpay?.key_secret
      });
      
      // Get order details from request body
      const { amount, currency = 'INR', receipt, notes } = req.body;
      
      // Validate required data
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required order data (amount)'
        });
      }
      
      console.log('Creating Razorpay order for amount:', amount);
      
      // Convert amount to paise (Razorpay uses smallest currency unit)
      const amountInPaise = Math.round(amount * 100);
      
      // Create order
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes
      });
      
      // Return order details
      return res.status(200).json({
        success: true,
        order,
        key_id: functions.config().razorpay?.key_id
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
        error: error.message
      });
    }
  });
});

/**
 * Verify Razorpay payment
 */
exports.verifyRazorpayPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Get payment details from request body
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
      
      // Validate required data
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment verification data'
        });
      }
      
      console.log('Verifying Razorpay payment:', razorpay_payment_id);
      
      // Create the signature verification data
      const crypto = require('crypto');
      const secret = functions.config().razorpay?.key_secret;
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');
      
      // Verify the signature
      if (generated_signature === razorpay_signature) {
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while verifying payment',
        error: error.message
      });
    }
  });
});

/**
 * Health check endpoint
 * Used to verify functions are running properly
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'Firebase Cloud Functions',
      emailConfig: {
        service: functions.config().email?.service || 'Not set',
        user: functions.config().email?.user ? 'Set' : 'Not set',
        pass: functions.config().email?.pass ? 'Set' : 'Not set'
      },
      razorpayConfig: {
        key_id: functions.config().razorpay?.key_id ? 'Set' : 'Not set',
        key_secret: functions.config().razorpay?.key_secret ? 'Set' : 'Not set'
      }
    });
  });
});