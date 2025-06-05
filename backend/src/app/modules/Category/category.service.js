const formatFileUrl = require("../../utils/formatFileUrl");
const { getPresignedUrl } = require("../../utils/formatMinioUrl");
const Category = require("./category.schema");

exports.createCategory = async (data) => {
  return await Category.create(data);
};

exports.getAllCategories = async () => {
  const categories = await Category.find().sort({ order: 1 });

  return categories.map(async (category) => {
    if (category.icon) {
      // category.icon = formatFileUrl(category.icon);
      category.icon = await getPresignedUrl(
        category.icon,
        "event-category-icons"
      );
    }
    return category;
  });
};

exports.getCategoryById = async (id) => {
  const data = await Category.findById(id);
  if (data.icon) {
    data.icon = await getPresignedUrl(data.icon, "event-category-icons");
  }
  return data;
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
