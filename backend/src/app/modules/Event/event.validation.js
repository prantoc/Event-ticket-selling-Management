const { z } = require("zod");
const { registerSchema } = require("../Auth/auth.validation");

const createUserValidation = registerSchema.extend({
    phone: z.string().regex(/^0?[1-9]\d{1,14}$/).optional(),
    role: z.string(['admin', 'user']).min(1),
});

const updateUserValidation = registerSchema.deepPartial();
const updateAccountStatusValidation = z.object({
    status: z.string(['active', 'disabled']).min(1),
})
module.exports = {
    createUserValidation,
    updateUserValidation,
    updateAccountStatusValidation
}