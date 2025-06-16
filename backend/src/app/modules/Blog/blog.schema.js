// blog.model.js
const mongoose = require("mongoose");
const slugify = require("../../utils/slugify");
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
    //   required: true,
      unique: true,
      lowercase: true,
    },
    featuredImage: { type: String },
    content: { type: String, required: true }, // Rich HTML content with image tags
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    publishDate: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
    const exists = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id },
    });
    if (exists) this.slug = `${this.slug}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
