/**
 * Netlify Function: Create Razorpay Order
 * 
 * Creates a new order in Razorpay for payment processing
 * Handles POST requests to /.netlify/functions/create-razorpay-order
 */

const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
  // Set CORS headers - allow all origins for development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No content
      headers
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }
  
  try {
    // Check if Razorpay credentials are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing from environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Razorpay credentials are not configured correctly',
          debug: {
            keyIdExists: !!process.env.RAZORPAY_KEY_ID,
            keySecretExists: !!process.env.RAZORPAY_KEY_SECRET
          }
        })
      };
    }
    
    // Create a Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Parse the request body
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid request body format. JSON expected.'
        })
      };
    }
    
    const { amount, currency = 'INR', receipt, notes } = requestData;
    
    // Validate required data
    if (!amount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required order data (amount)'
        })
      };
    }
    
    console.log('Creating Razorpay order for amount:', amount, 'currency:', currency);
    
    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    // Create order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes
    });
    
    console.log('Razorpay order created successfully:', order.id);
    
    // Return order details
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order,
        key_id: process.env.RAZORPAY_KEY_ID
      })
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to create Razorpay order',
        error: error.message
      })
    };
  }
};