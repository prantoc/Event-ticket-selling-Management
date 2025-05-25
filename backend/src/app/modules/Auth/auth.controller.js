const transporter = require('../../utils/transporterMail');


const catchAsync = require('../../utils/catchAsync');
const { createToken, verifyToken } = require('../../utils/jwt');
const sendConfirmationEmail = require('../../utils/sendConfirmationEmail');
const sendResponse = require('../../utils/sendResponse');
const { registerUser, loginUser } = require('./auth.service');
const httpStatus = require('http-status').default;
const UserModel = require('../User/user.schema');
const AppError = require('../../errors/AppError');
const hashPassword = require('../../utils/hashedPassword');


const login = catchAsync(async (req, res) => {
    const loginData = req.body;
    const result = await loginUser(loginData);
    sendResponse(res, {
        success: true,
        message: 'Login successful',
        data: result,
        statusCode: httpStatus.OK
    });
})
const register = catchAsync(async (req, res) => {
    const registerData = req.body;
    const user = await registerUser(registerData);
    const verificationToken = createToken({ email: user.email, role: user.role });
    sendConfirmationEmail(user.email, verificationToken);
    sendResponse(res, {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: user,
        statusCode: httpStatus.CREATED
    });
})

const verfiyEmail = catchAsync(async (req, res) => {
    const token = req.query.token;
    const decoded = verifyToken(token);
    const { email } = decoded;
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already verified');
    }
    user.isVerified = true;
    await user.save();
    sendResponse(res, {
        success: true,
        message: 'Email verified successfully and account activated',
        data: null,
        statusCode: httpStatus.OK
    });
})

const resendVerification = catchAsync(async (req, res) => {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already verified');
    }
    const verificationToken = createToken({ email: user.email, role: user.role });
    sendConfirmationEmail(user.email, verificationToken);
    sendResponse(res, {
        success: true,
        message: 'Verification email sent',
        data: null,
        statusCode: httpStatus.OK
    });
})

const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const token = createToken({ email: user.email }, "15m");
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await transporter.sendMail({
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click <a target="_blank" href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
    });

    sendResponse(res, {
        success: true,
        message: 'Password reset email sent',
        data: null,
        statusCode: httpStatus.OK
    });
})


const resetPassword = catchAsync(async (req, res) => {
    const { newPassword, token } = req.body;
    const decoded = verifyToken(token);
    const user = await UserModel.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await UserModel.updateOne({ email: user.email }, { $set: { password: await hashPassword(newPassword) } });
    sendResponse(res, {
        success: true,
        message: 'Password reset successful',
        data: null,
        statusCode: httpStatus.OK
    })

})

const AuthController = {
    login,
    register,
    verfiyEmail,
    resendVerification,
    forgotPassword,
    resetPassword
}
module.exports = AuthController