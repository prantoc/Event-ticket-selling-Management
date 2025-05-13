const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  icon: String,
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generate slug and order
categorySchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');

    // Ensure unique slug
    const exists = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });
    if (exists) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }

  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.order = count + 1;
  }

  next();
});

module.exports = mongoose.model('Category', categorySchema);
