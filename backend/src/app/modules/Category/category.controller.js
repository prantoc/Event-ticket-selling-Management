const categoryService = require('./category.service');

exports.createCategory = async (req, res) => {
  try {
    const icon = req.file ? req.file.path : null;
    const category = await categoryService.createCategory({ ...req.body, icon });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to create category", error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to get categories", error: err.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch category", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to update category", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted and order normalized" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete category", error: err.message });
  }
};
