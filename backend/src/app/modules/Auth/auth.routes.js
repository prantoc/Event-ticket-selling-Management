const validateRequest = require('../../middleware/validateRequest');
const AuthController = require('./auth.controller');
const { loginSchema, registerSchema, resendVerificationSchema, resetPasswordSchema } = require('./auth.validation');

const router = require('express').Router();
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.get('/verify-email', AuthController.verfiyEmail);
router.post('/resend-verification', validateRequest(resendVerificationSchema), AuthController.resendVerification);
router.post('/forgot-password', validateRequest(resendVerificationSchema), AuthController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);

const authRoutes = router;
module.exports = authRoutes;