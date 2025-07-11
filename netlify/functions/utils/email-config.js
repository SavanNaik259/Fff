/**
 * Nodemailer Configuration for Netlify Functions
 * This file contains the configuration for the Nodemailer service.
 */

const nodemailer = require('nodemailer');

/**
 * Get the email transport configuration from environment variables
 * @returns {Object} Nodemailer transport configuration
 */
function getEmailConfig() {
  // Load variables from environment with defaults
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailHost = process.env.EMAIL_HOST || '';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASS || '';
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  
  console.log('Email configuration:', {
    service: emailService,
    host: emailHost ? 'configured' : 'not configured',
    port: emailPort,
    secure: emailSecure,
    user: emailUser ? `${emailUser.substring(0, 3)}...` : 'missing',
    pass: emailPass ? 'configured' : 'missing'
  });
  
  // Create the configuration object
  const config = {
    // If a service like Gmail is specified, use it
    ...(emailService && { service: emailService }),
    // Otherwise use host and port
    ...(emailHost && { host: emailHost }),
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Add debugging and connection timeout settings
    debug: false,
    logger: true,
    connectionTimeout: 10000, // 10 seconds
  };
  
  return config;
}

/**
 * Create a Nodemailer transport
 * @returns {Object} Nodemailer transport
 */
function createTransport() {
  return nodemailer.createTransport(getEmailConfig());
}

module.exports = {
  createTransport,
  getEmailConfig
};