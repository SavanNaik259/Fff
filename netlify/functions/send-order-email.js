/**
 * Netlify Function: Send Order Email
 * 
 * Sends order confirmation emails to customer and shop owner
 * Handles POST requests to /.netlify/functions/send-order-email
 */

const emailService = require('./utils/email-service');

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
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials missing from environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email service is not configured correctly',
          debug: {
            emailUserExists: !!process.env.EMAIL_USER,
            emailPassExists: !!process.env.EMAIL_PASS,
            emailServiceExists: !!process.env.EMAIL_SERVICE
          }
        })
      };
    }
    
    // Parse the request body
    let orderData;
    try {
      orderData = JSON.parse(event.body);
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
    
    // Validate required data
    if (!orderData || !orderData.customer || !orderData.products) {
      console.error('Missing required order data:', {
        hasOrderData: !!orderData,
        hasCustomer: !!(orderData && orderData.customer),
        hasProducts: !!(orderData && orderData.products)
      });
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required order data',
          debug: {
            hasOrderData: !!orderData,
            hasCustomer: !!(orderData && orderData.customer),
            hasProducts: !!(orderData && orderData.products)
          }
        })
      };
    }
    
    console.log('Received order email request for:', orderData.orderReference);
    
    // Send emails
    const result = await emailService.sendOrderEmails(orderData);
    
    if (result.success) {
      console.log('Order emails sent successfully for:', orderData.orderReference);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Order emails sent successfully',
          result
        })
      };
    } else {
      console.error('Failed to send order emails:', result.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Failed to send order emails',
          error: result.error
        })
      };
    }
  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Server error while sending order emails',
        error: error.message
      })
    };
  }
};