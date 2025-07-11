/**
 * Email Templates Module
 * 
 * This module contains HTML templates for different types of emails sent by the system.
 * Each template is a function that takes data parameters and returns formatted HTML.
 */

/**
 * Customer Order Confirmation Email Template
 * 
 * @param {Object} data - Order data
 * @param {Object} data.customer - Customer information
 * @param {Array} data.products - Products in the order
 * @param {String} data.orderReference - Order reference number
 * @param {String} data.orderDate - Order date
 * @param {Number} data.orderTotal - Order total
 * @returns {String} - HTML email content
 */
function customerOrderTemplate(data) {
  const { customer, products, orderReference, orderDate, orderTotal, paymentMethod } = data;
  
  // Format date to be more readable
  const orderDateFormatted = new Date(orderDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Format the products into an HTML table
  const productsHTML = products.map(product => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1;">${product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1; text-align: center;">${product.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1; text-align: right;">$${product.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1; text-align: right;">$${product.total.toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Auric Jewelry</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #f8f9fa;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #000;
        text-decoration: none;
      }
      .order-info {
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 5px;
      }
      .products-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .products-table th {
        background-color: #f1f1f1;
        padding: 10px;
        text-align: left;
      }
      .total-row {
        font-weight: bold;
        background-color: #f8f9fa;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        padding: 20px 0;
        font-size: 12px;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Auric Jewelry</div>
      </div>
      
      <h2>Order Confirmation</h2>
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      <p>Thank you for your order. We're pleased to confirm that we've received your order and it's being processed.</p>
      
      <div class="order-info">
        <p><strong>Order Reference:</strong> ${orderReference}</p>
        <p><strong>Order Date:</strong> ${orderDateFormatted}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      </div>
      
      <h3>Order Summary</h3>
      <table class="products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
          <tr class="total-row">
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;">$${orderTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <h3>Shipping Information</h3>
      <p>${customer.firstName} ${customer.lastName}<br>
      ${customer.address}<br>
      ${customer.city ? customer.city + ', ' : ''}${customer.state ? customer.state + ' ' : ''}${customer.postalCode || ''}<br>
      Phone: ${customer.phone}</p>
      
      <p>If you have any questions about your order, please contact our customer service team at <a href="mailto:auricbysubha.web@gmail.com">auricbysubha.web@gmail.com</a>.</p>
      
      <p>Thank you for shopping with Auric Jewelry!</p>
      
      <div class="footer">
        <p>&copy; 2025 Auric Jewelry. All Rights Reserved.</p>
        <p>This email was sent to ${customer.email}</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Store Owner Order Notification Email Template
 * 
 * @param {Object} data - Order data
 * @param {Object} data.customer - Customer information
 * @param {Array} data.products - Products in the order
 * @param {String} data.orderReference - Order reference number
 * @param {String} data.orderDate - Order date
 * @param {Number} data.orderTotal - Order total
 * @returns {String} - HTML email content
 */
function ownerOrderTemplate(data) {
  const { customer, products, orderReference, orderDate, orderTotal, paymentMethod, notes } = data;
  
  // Format date to be more readable
  const orderDateFormatted = new Date(orderDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Format the products into an HTML table
  const productsHTML = products.map(product => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1;">${product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1; text-align: center;">${product.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1; text-align: right;">$${product.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e1e1; text-align: right;">$${product.total.toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification - Auric Jewelry</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #f8f9fa;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #000;
        text-decoration: none;
      }
      .order-info {
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 5px;
      }
      .products-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .products-table th {
        background-color: #f1f1f1;
        padding: 10px;
        text-align: left;
      }
      .total-row {
        font-weight: bold;
        background-color: #f8f9fa;
      }
      .customer-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      .notes {
        background-color: #fff8e1;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
        border-left: 4px solid #ffc107;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        padding: 20px 0;
        font-size: 12px;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Auric Jewelry</div>
      </div>
      
      <h2>New Order Received</h2>
      <p>A new order has been placed on your store.</p>
      
      <div class="order-info">
        <p><strong>Order Reference:</strong> ${orderReference}</p>
        <p><strong>Order Date:</strong> ${orderDateFormatted}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      </div>
      
      <h3>Customer Information</h3>
      <div class="customer-info">
        <p><strong>Name:</strong> ${customer.firstName} ${customer.lastName}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Address:</strong><br>
        ${customer.address}<br>
        ${customer.city ? customer.city + ', ' : ''}${customer.state ? customer.state + ' ' : ''}${customer.postalCode || ''}</p>
      </div>
      
      ${notes ? `
      <h3>Order Notes</h3>
      <div class="notes">
        <p>${notes}</p>
      </div>
      ` : ''}
      
      <h3>Order Items</h3>
      <table class="products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
          <tr class="total-row">
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;">$${orderTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <p>Please process this order as soon as possible.</p>
      
      <div class="footer">
        <p>&copy; 2025 Auric Jewelry. All Rights Reserved.</p>
        <p>This is an automated email from your Auric Jewelry website.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  customerOrderTemplate,
  ownerOrderTemplate
};