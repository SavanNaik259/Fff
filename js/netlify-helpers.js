/**
 * Netlify Functions Helper
 * 
 * This file provides utility functions for working with Netlify Functions
 * in both local development and production environments.
 */

// Determine if we're running in production (Netlify) or development (localhost)
const isProduction = !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

/**
 * Get the base URL for API requests to Netlify Functions
 * @returns {string} The base URL to use for API requests
 */
function getApiBaseUrl() {
  // Always use /.netlify/functions directly in production
  // This ensures we're accessing the functions directly without relying on redirects
  if (isProduction) {
    return '/.netlify/functions';
  }
  
  // In development, use the redirects from netlify.toml to map /api/ to /.netlify/functions/
  return '/api';
}

/**
 * Make an API request to a Netlify Function
 * 
 * @param {string} endpoint - The function name/endpoint (without leading slash)
 * @param {Object} options - Fetch API options (method, headers, body, etc.)
 * @returns {Promise<Object>} - Promise resolving to the JSON response
 */
async function callNetlifyFunction(endpoint, options = {}) {
  // Ensure we have default headers
  if (!options.headers) {
    options.headers = {};
  }
  
  // Add Content-Type header for JSON if not specified and we have a body
  if (options.body && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }
  
  // Create the URL
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/${endpoint}`;
  
  try {
    console.log(`Calling Netlify Function: ${url}`, options);
    
    // Add a timeout to the fetch call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    // Clone options and add signal
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    // Log response status
    console.log(`Netlify Function response: ${response.status} ${response.statusText}`);
    
    // Try to parse the JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Failed to parse response from ${endpoint}: ${parseError.message}`);
    }
    
    // If response is not ok, throw an error
    if (!response.ok) {
      console.error('API error response:', data);
      throw new Error(data.message || data.error || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Check if it's an abort error (timeout)
    if (error.name === 'AbortError') {
      console.error(`Timeout calling Netlify Function ${endpoint}`);
      throw new Error(`Request to ${endpoint} timed out after 30 seconds`);
    }
    
    console.error(`Error calling Netlify Function ${endpoint}:`, error);
    throw error;
  }
}

// Export the helper functions
window.netlifyHelpers = {
  getApiBaseUrl,
  callNetlifyFunction,
  isProduction
};