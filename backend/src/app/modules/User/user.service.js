const QueryBuilder = require("../../builder/QueryBuilder");
const AppError = require("../../errors/AppError");
const hashPassword = require("../../utils/hashedPassword");

const { searchableFields, filterableFields } = require("./user.constants");
const UserModel = require("./user.schema");
const httpStatus = require("http-status").default;
const users = async (query,adminId) => {
  const builder = new QueryBuilder(UserModel.find({
    isDeleted: false,

    _id : {
      $ne: adminId
    }
  }), query).search(['name', 'email']).filter(filterableFields).sort().paginate().fields();
  const result = await builder.modelQuery;
  const meta = await builder.countTotal();
  return {
    users: result,
    meta,
  };
};

const getSuperAdminEmails = async () => {
  const superAdmins = await UserModel.find(
    {
      role: "superAdmin",
      isDeleted: false,
    },
    { email: 1, _id: 0 } // only return email field
  );

  // Extract just the emails
  const emails = superAdmins.map((user) => user.email);
  return emails;
};


const getUserByID = async (id) => {
  const user = await UserModel.findOne({ _id: id, isDeleted: false });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const createUser = async (payload) => {
  const isExist = await UserModel.findOne({ email: payload.email });
  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist");
  }

  const result = await UserModel.create({
    ...payload
  });
  return result;
};

const updateUser = async (id, payload) => {
  const user = await UserModel.findOne({ _id: id });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (payload.password) {
    payload.needsPasswordChange = true;
    payload.password = await hashPassword(payload.password);
  }
  const result = await UserModel.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteUser = async (id) => {
  const user = await UserModel.findOne({ _id: id });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  const result = await UserModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true, runValidators: true }
  );

  return result;
};

const updateAccountStatus = async (id, status) => {
  const user = await UserModel.findOne({ _id: id });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const result = await UserModel.findOneAndUpdate(
    { _id: id },
    { status, isDeleted: status === "active" ? false : user.isDeleted },
    { new: true, runValidators: true }
  );

  return result;
};

const setUserPreferences = async (userId, preferences) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { preferences: preferences },
    { new: true }
  ).select('name email preferences');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

const UserService = {
  users,
  createUser,
  updateUser,
  deleteUser,
  updateAccountStatus,
  getUserByID,
  setUserPreferences,
  getSuperAdminEmails,
};

module.exports = UserService;
