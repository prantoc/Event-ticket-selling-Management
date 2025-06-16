const fs = require("fs");
const path = require("path");
const categoryService = require("./category.service");

exports.createCategory = async (req, res) => {
  try {
    const user = req.user;
    // const icon = req.file ? req.file.path : null;
    const icon = req.minioFiles ? req.minioFiles.icon : null;
    const category = await categoryService.createCategory({
      ...req.body,
      icon,
      isActive: user.role === "user" ? false : true,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create category",
      error: err.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categoriesPromiseArray = await categoryService.getAllCategories();
    const categories = await Promise.all(categoriesPromiseArray);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: err.message,
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: err.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Fetch existing category
    const existingCategory = await categoryService.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: "",
      });
    }

    let updateData = { ...req.body };

    // ✅ Use new MinIO uploaded icon (if provided)
    if (req.minioFiles?.icon) {
      updateData.icon = req.minioFiles.icon;
    } else {
      // Keep existing icon if no new one was uploaded
      updateData.icon = existingCategory.icon;
    }

    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      updateData
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: err.message,
    });
  }
};

exports.approveCategory = async (req, res) => {
  try {
    const approvedCategory = await categoryService.updateCategory(
      req.params.id,
      { isActive: true }
    );

    if (!approvedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: "",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category approved successfully",
      data: approvedCategory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to approve category",
      error: err.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    // Delete associated image (icon)
    if (deleted.icon) {
      const relativePath = deleted.icon;
      const imagePath = path.join(__dirname, "../../local", relativePath);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn("Failed to delete icon:", err.message);
        }
      });
    }

    res.json({
      success: true,
      message: "Category deleted and order normalized",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: err.message,
    });
  }
};
