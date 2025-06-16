// blog.model.js
const mongoose = require("mongoose");
const slugify = require("slugify");
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
  // Step 1: Determine base slug
  let baseSlug = this.slug?.trim(); // user-provided slug, if any

  if (!baseSlug && this.title) {
    baseSlug = slugify(this.title, { lower: true, strict: true });
  }

  if (baseSlug) {
    let slug = baseSlug;
    let count = 1;

    // Step 2: Ensure uniqueness
    while (
      await this.constructor.findOne({
        slug,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }

  next();
});

module.exports = mongoose.model("Blog", blogSchema);
