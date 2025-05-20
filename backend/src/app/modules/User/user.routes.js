const auth = require("../../middleware/auth");
const validateRequest = require("../../middleware/validateRequest");
const UserController = require("./user.controller");

const router = require("express").Router();
const {
  createUserValidation,
  updateAccountStatusValidation,
} = require("./user.validation");

router.get("/", auth("superAdmin", "admin"), UserController.users);
router.post(
  "/",
  auth("superAdmin"),
  validateRequest(createUserValidation),
  UserController.createUser
);

router.patch(
  "/me",
  auth("user", "organizer", "admin", "superAdmin"),
  UserController.updateUser
);
router.patch("/:id", auth("superAdmin"), UserController.updateUserByAdmin);
router.patch(
  "/:id/status",
  auth("superAdmin"),
  validateRequest(updateAccountStatusValidation),
  UserController.updateAccountStatus
);
router.delete("/:id", auth("superAdmin"), UserController.deleteUser);
router.get(
  "/me",
  auth("user", "organizer", "admin", "superAdmin"),
  UserController.getUserByID
);
const userRoutes = router;
module.exports = userRoutes;
