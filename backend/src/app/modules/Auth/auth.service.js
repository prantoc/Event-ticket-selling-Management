const UserModel = require('../User/user.schema');
const httpStatus = require('http-status').default;
const AppError = require('../../errors/AppError');
const bcrypt = require('bcrypt');
const compareValidPass = require('../../utils/validPass');
const { createToken } = require('../../utils/jwt');
const registerUser = async (payload) => {
    const isExist = await UserModel.findOne({ email: payload.email });
    if (isExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already exist');
    }
    const result = await UserModel.create(payload);
    return result;
}


const loginUser = async (payload) => {
    const user = await UserModel.findOne({ email: payload.email }).lean();
    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
    }
    if (!user.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Please verify your email before logging in');
    }
    const isMatch = await compareValidPass(payload.password, user.password);
    if (!isMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
    }
    const token = createToken({ email: user.email, userId: user._id, role: user.role });
    const {password , ...res} = user;
    return {
        ...res,
        accessToken: token
    };

}


module.exports = {
    registerUser,
    loginUser
}