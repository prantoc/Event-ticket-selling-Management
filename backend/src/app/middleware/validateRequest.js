
const catchAsync = require('../utils/catchAsync');

const validateRequest = (schema) => {
    return catchAsync(async (req, res, next) => {
        await schema.parseAsync(req.body);
        next();
    });
};

module.exports = validateRequest;
