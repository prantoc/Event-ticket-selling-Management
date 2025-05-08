
/**
 * @description - This function sends a JSON response with the given data
 * @param {Object} res - The ExpressJS response object
 * @param {Object} data - An object containing the following properties:
 * - success: A boolean indicating if the request was successful
 * - message: A string with a message to be sent to the client
 * - meta: An object containing any additional metadata
 * - data: An object containing the data to be sent to the client
 * @returns {undefined}
 */
const sendResponse = (res, data) => {
    res.status(data?.statusCode).json({
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data,
    });
};

module.exports = sendResponse;
