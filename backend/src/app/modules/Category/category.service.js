const Category = require("./category.schema");

exports.createCategory = async (data) => {
  return await Category.create(data);
};

exports.getAllCategories = async () => {
  return await Category.find().sort({ order: 1 });
};

exports.getCategoryById = async (id) => {
  return await Category.findById(id);
};

exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCategory = async (id) => {
  const deleted = await Category.findByIdAndDelete(id);
  if (deleted) await normalizeCategoryOrder();
  return deleted;
};

const normalizeCategoryOrder = async () => {
  const categories = await Category.find().sort({ order: 1 });
  for (let i = 0; i < categories.length; i++) {
    categories[i].order = i + 1;
    await categories[i].save();
  }
};
