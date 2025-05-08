
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

// Generate Access Token
const createToken = (payload , expiresIn = config.jwt_access_expires_in) => {


    // Generate a random secret for HS256 algorithm
    const secret = config.jwt_access_secret
    return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn: expiresIn
    });
};

// Verify Token
const verifyToken = (token) => {
    try {
        // Verify the token with the stored secret
        return jwt.verify(token, config.jwt_access_secret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    createToken,
    verifyToken
};

