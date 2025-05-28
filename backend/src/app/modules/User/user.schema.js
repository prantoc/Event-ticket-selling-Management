const hashPassword = require("../../utils/hashedPassword");
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "user", "organizer"],
      required: false,
      default: "user",
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    previouslyLoggedIn: {
      type: Boolean,
      default: false,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    preferences: {
      type: [String],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const hash = await hashPassword(user.password);
  user.password = hash;
  next();
});

// user.model.js or wherever your User schema is defined
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("organizerProfile", {
  ref: "Organizer",
  localField: "_id",
  foreignField: "userId", // OrganizerProfile.userId
  justOne: true,
});

module.exports = mongoose.model("User", UserSchema);
