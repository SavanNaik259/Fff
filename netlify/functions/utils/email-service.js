/**
 * Email Service for Netlify Functions
 * Handles sending emails for various purposes using Nodemailer
 */

const { createTransport } = require('./email-config');
const templates = require('./email-templates');

/**
 * Send an order confirmation email to the customer
 * 
 * @param {Object} orderData - Order data including customer information and products
 * @returns {Promise<Object>} - Result of email sending operation
 */
async function sendCustomerOrderConfirmation(orderData) {
  try {
    // Create a nodemailer transporter
    const transporter = createTransport();
    const { customer } = orderData;
    
    // Validate required data
    if (!customer || !customer.email) {
      throw new Error('Customer email is required to send order confirmation');
    }
    
    // Get the HTML template for customer email
    const htmlContent = templates.customerOrderTemplate(orderData);
    
    // Define email options
    const mailOptions = {
      from: `"Auric Jewelry" <${process.env.EMAIL_USER || 'auricbysubha.web@gmail.com'}>`,
      to: customer.email,
      subject: `Order Confirmation - ${orderData.orderReference}`,
      html: htmlContent,
      // Text version for email clients that don't support HTML
      text: `Order Confirmation - ${orderData.orderReference}
        
Thank you for your order at Auric Jewelry!
        
Order Reference: ${orderData.orderReference}
Order Date: ${new Date(orderData.orderDate).toLocaleString()}
Total: $${orderData.orderTotal.toFixed(2)}
        
Your order has been received and is being processed.
        
If you have any questions, please contact us at auricbysubha.web@gmail.com.
      `
    };
    
    // Send the email
    console.log(`Sending order confirmation email to customer: ${customer.email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to customer: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error sending customer order confirmation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send an order notification email to the store owner
 * 
 * @param {Object} orderData - Order data including customer information and products
 * @returns {Promise<Object>} - Result of email sending operation
 */
async function sendOwnerOrderNotification(orderData) {
  try {
    // Create a nodemailer transporter
    const transporter = createTransport();
    // Get the owner's email from environment variables
    const ownerEmail = process.env.OWNER_EMAIL || 'auricbysubha.web@gmail.com';
    
    // Validate required data
    if (!ownerEmail) {
      throw new Error('Owner email is required to send order notification');
    }
    
    // Get the HTML template for owner email
    const htmlContent = templates.ownerOrderTemplate(orderData);
    
    // Define email options
    const mailOptions = {
      from: `"Auric Jewelry Orders" <${process.env.EMAIL_USER || 'auricbysubha.web@gmail.com'}>`,
      to: ownerEmail,
      subject: `New Order - ${orderData.orderReference}`,
      html: htmlContent,
      // Text version for email clients that don't support HTML
      text: `New Order - ${orderData.orderReference}
        
A new order has been placed on your Auric Jewelry store.
        
Order Reference: ${orderData.orderReference}
Order Date: ${new Date(orderData.orderDate).toLocaleString()}
Customer: ${orderData.customer.firstName} ${orderData.customer.lastName}
Email: ${orderData.customer.email}
Phone: ${orderData.customer.phone}
Total: $${orderData.orderTotal.toFixed(2)}
        
Please log in to your dashboard to view the complete order details.
      `
    };
    
    // Send the email
    console.log(`Sending order notification email to owner: ${ownerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent to owner: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error sending owner order notification email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send both customer and owner emails for an order
 * 
 * @param {Object} orderData - Order data including customer information and products
 * @returns {Promise<Object>} - Results of both email sending operations
 */
async function sendOrderEmails(orderData) {
  try {
    // Send both emails in parallel
    const [customerResult, ownerResult] = await Promise.all([
      sendCustomerOrderConfirmation(orderData),
      sendOwnerOrderNotification(orderData)
    ]);
    
    return {
      success: customerResult.success && ownerResult.success,
      customer: customerResult,
      owner: ownerResult
    };
  } catch (error) {
    console.error('Error sending order emails:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export the email service functions
module.exports = {
  sendCustomerOrderConfirmation,
  sendOwnerOrderNotification,
  sendOrderEmails
};