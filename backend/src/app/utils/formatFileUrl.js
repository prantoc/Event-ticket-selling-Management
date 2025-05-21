const { backend_url } = require("../config");
const BASE_URL = backend_url || "http://localhost:5000";
const API_PATH = "/api/v1/local/";

/**
 * Formats a relative path into a complete file URL
 * Prevents duplication of URL components
 * 
 * @param {string} relativePath - The relative file path
 * @returns {string|null} - The properly formatted URL or null if no path provided
 */
const formatFileUrl = (relativePath) => {
  if (!relativePath) return null;
  
  // Check if the URL already contains the base URL and API path
  if (relativePath.includes(BASE_URL) && relativePath.includes(API_PATH)) {
    return relativePath;
  }
  
  // Check if it's already a complete URL (starts with http)
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Remove leading API_PATH if it exists in the relative path
  // This prevents duplication when the path already contains /api/v1/local/
  if (relativePath.startsWith(API_PATH.substring(1))) {
    relativePath = relativePath.substring(API_PATH.length - 1);
  }
  
  // Remove any leading slashes for consistent formatting
  while (relativePath.startsWith('/')) {
    relativePath = relativePath.substring(1);
  }
  
  return `${BASE_URL}${API_PATH}${relativePath}`;
};

module.exports = formatFileUrl;