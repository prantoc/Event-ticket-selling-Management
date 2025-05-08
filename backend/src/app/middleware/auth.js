const { NextFunction, Request, Response } = require('express');
const httpStatus = require('http-status').default;
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../errors/AppError');
const UserModel = require('../modules/User/user.schema');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');


const auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const headers = req.headers.authorization;
 
    const token = headers?.split(' ')[1];
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }
    // checking if the given token is valid
    const decoded = verifyToken(token);
    const { role, userId,email, iat } = decoded;
    const user = await UserModel.findOne({email}).lean();

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }
    const isDeleted = user.isDeleted;
    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }
    const userStatus = user.status;
    if (userStatus === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
    }


    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized  hi!',
      );
    }

    req.user = Object.assign({}, decoded, { role });
    next();
  });
};

module.exports = auth;
