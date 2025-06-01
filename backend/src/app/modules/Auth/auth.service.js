const UserModel = require("../User/user.schema");
const Organizer = require("../Organizer/organizer.schema");
const httpStatus = require("http-status").default;
const AppError = require("../../errors/AppError");
const bcrypt = require("bcrypt");
const compareValidPass = require("../../utils/validPass");
const { createToken } = require("../../utils/jwt");
const organizerSchema = require("../Organizer/organizer.schema");
const registerUser = async (payload) => {
  const isExist = await UserModel.findOne({ email: payload.email });
  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const createdUser = await UserModel.create(payload);
  return createdUser.toObject(); // Optional: if you want a plain JS object
};

const loginUser = async (payload) => {
  const user = await UserModel.findOne({ email: payload.email }).lean();
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  if (!user.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please verify your email before logging in"
    );
  }

  const isPreviouslyLoggedIn = user.previouslyLoggedIn || false;
  const isMatch = await compareValidPass(payload.password, user.password);

  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not match");
  }

  // ✅ Update previouslyLoggedIn to true if not already
  if (!isPreviouslyLoggedIn) {
    await UserModel.updateOne({ _id: user._id }, { previouslyLoggedIn: true });
  }

  // ✅ Fetch verificationStatus if user is an organizer
  let verificationStatus = null;
  if (user) {
    const organizer = await organizerSchema
      .findOne({
        userId: user._id,
      })
      .lean();

    if (organizer) {
      verificationStatus = organizer.verificationStatus || null;
    }
  }

  const token = createToken({
    email: user.email,
    userId: user._id,
    role: user.role,
  });

  const { password, previouslyLoggedIn, ...res } = user;

  return {
    ...res,
    isPreviouslyLoggedIn,
    verificationStatus, // ✅ include in response
    accessToken: token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
