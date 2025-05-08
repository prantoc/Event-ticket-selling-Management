

const z = require('zod');

const loginSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
});

const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().min(1),
    password: z.string().min(1),
});
const resendVerificationSchema = z.object({
    email: z.string({ message: 'Please enter a valid email address' }).email().min(1),
});
const resetPasswordSchema = z.object({
    newPassword: z.string().min(1),
    token: z.string().min(1),
});


module.exports = { loginSchema, registerSchema, resendVerificationSchema ,resetPasswordSchema};