/**
 * Nodemailer Configuration for Firebase Functions
 * This file contains the configuration for the Nodemailer service.
 */

const nodemailer = require('nodemailer');
const functions = require('firebase-functions');

/**
 * Get the email transport configuration from Firebase Functions config
 * @returns {Object} Nodemailer transport configuration
 */
function getEmailConfig() {
  // Get config from Firebase Functions config (set using firebase functions:config:set)
  const emailService = functions.config().email?.service || 'gmail';
  const emailUser = functions.config().email?.user;
  const emailPass = functions.config().email?.pass;
  const emailHost = functions.config().email?.host;
  const emailPort = parseInt(functions.config().email?.port || '587', 10);
  const emailSecure = functions.config().email?.secure === 'true';
  
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