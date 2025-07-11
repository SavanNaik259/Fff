/**
 * Email Module Export
 * 
 * This file exports all the email-related modules for easier imports elsewhere
 */

const templates = require('./templates');
const config = require('./config');
const service = require('./service');

module.exports = {
  templates,
  config,
  service
};