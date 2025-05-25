const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");
const UserService = require("./user.service");
const httpStatus = require("http-status").default;

const users = catchAsync(async (req, res) => {
    const adminId = req.user.userId
    const result = await UserService.users(req.query,adminId);
    sendResponse(res, {
        success: true,
        message: 'Users fetched successfully',
        data: result,
        statusCode: httpStatus.OK
    });
})

const getUserByID = catchAsync(async (req, res) => {
    const id = req.user.userId;
    
    const result = await UserService.getUserByID(id);
    sendResponse(res, {
        success: true,
        message: 'User fetched successfully',
        data: result,
        statusCode: httpStatus.OK
    });
})

const createUser = catchAsync(async (req, res) => {
    const result = await UserService.createUser(req.body);
    sendResponse(res, {
        success: true,
        message: 'User created successfully',
        data: result,
        statusCode: httpStatus.CREATED
    });
})

const updateUserByAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserService.updateUser(id, req.body);
    sendResponse(res, {
        success: true,
        message: 'User updated successfully',
        data: result,
        statusCode: httpStatus.OK
    });
})
const updateUser = catchAsync(async (req, res) => {
    const  id  = req.user.userId;
    console.log(id);
    console.log(req.body) ;
    
    const result = await UserService.updateUser(id, req.body);
    sendResponse(res, {
        success: true,
        message: 'User updated successfully',
        data: result,
        statusCode: httpStatus.OK
    });
})

const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);

    sendResponse(res, {
        success: true,
        message: 'User deleted successfully',
        data: result,
        statusCode: httpStatus.OK
    });
})

const updateAccountStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const status = req.body.status
    const result = await UserService.updateAccountStatus(id ,status);
    sendResponse(res, {
        success: true,
        message: 'Account disabled successfully',
        data: result,
        statusCode: httpStatus.OK
    });
})

const updatePreferences = async (req, res) => {
  try {
    const  userId  = req.user.userId;
    const { preference } = req.body;

    if (!Array.isArray(preference)) {
      return res.status(400).json({
        success: false,
        message: 'Preference must be an array of strings',
      });
    }

    const updatedUser = await UserService.setUserPreferences(userId, preference);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message,
    });
  }
};

const UserController = {
    users,
    createUser,
    updateUser,
    deleteUser,
    updateAccountStatus,
    updateUserByAdmin,
    getUserByID,
    updatePreferences
}
module.exports = UserController