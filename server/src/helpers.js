const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = id => {
  return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = id => {
  return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
