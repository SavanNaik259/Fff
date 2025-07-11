/**
 * Netlify Function: Verify Razorpay Payment
 * 
 * Verifies the signature of a Razorpay payment to confirm it's legitimate
 * Handles POST requests to /.netlify/functions/verify-razorpay-payment
 */

const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Or restrict to your domains
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Parse the request body
    const requestData = JSON.parse(event.body);
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = requestData;
    
    // Validate required data
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required payment verification data'
        })
      };
    }
    
    console.log('Verifying Razorpay payment:', razorpay_payment_id);
    
    // Create the signature verification data
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
    
    // Verify the signature
    if (generated_signature === razorpay_signature) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Payment verified successfully'
        })
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Payment verification failed'
        })
      };
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Server error while verifying payment',
        error: error.message
      })
    };
  }
};