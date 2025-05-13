const { backend_url } = require("../config");

const BASE_URL = backend_url || "http://localhost:5000";

const formatFileUrl = (relativePath) => {
  if (!relativePath) return null;
  return `${BASE_URL}/api/v1/local/${relativePath}`;
};

module.exports = formatFileUrl;
