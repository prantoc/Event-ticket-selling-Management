const { z } = require('zod');

const contactSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  message: z.string().nonempty()
});

module.exports = { contactSchema };
