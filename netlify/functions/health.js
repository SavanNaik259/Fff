/**
 * Netlify Function: Health Check
 * 
 * Simple health check endpoint to verify functions are working
 * Handles GET requests to /.netlify/functions/health
 */

exports.handler = async (event, context) => {
  // Set CORS headers - allow all origins for development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No content
      headers
    };
  }
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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
    // Check if environment variables are configured
    const environmentStatus = {
      email: {
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        service: process.env.EMAIL_SERVICE || 'not set',
        user_exists: !!process.env.EMAIL_USER,
        pass_exists: !!process.env.EMAIL_PASS
      },
      razorpay: {
        configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        key_id_exists: !!process.env.RAZORPAY_KEY_ID,
        key_secret_exists: !!process.env.RAZORPAY_KEY_SECRET
      }
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Netlify Functions are running',
        time: new Date().toISOString(),
        environment: environmentStatus
      })
    };
  } catch (error) {
    console.error('Error in health check function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Health check failed',
        error: error.message
      })
    };
  }
};