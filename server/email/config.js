/**
 * Nodemailer Configuration
 * This file contains the configuration for the Nodemailer service.
 * It exports a function that creates a Nodemailer transporter based on environment variables.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Get the email transport configuration from environment variables
 * @returns {Object} Nodemailer transport configuration
 */
function getEmailConfig() {
  const emailService = process.env.EMAIL_SERVICE || '';
  const emailHost = process.env.EMAIL_HOST || '';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASS || '';
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  
  // Log configuration (without sensitive data)
  console.log('Email configuration:', {
    service: emailService || 'Not set',
    host: emailHost || 'Not set',
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser ? 'Set' : 'Not set',
      pass: emailPass ? 'Set' : 'Not set',
    }
  });
  
  // Check if we have the minimum required information
  if (!emailUser || !emailPass) {
    console.warn('Email credentials not set - emails will not be sent');
  }
  
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