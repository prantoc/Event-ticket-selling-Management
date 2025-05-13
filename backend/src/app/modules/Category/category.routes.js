const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { uploadMedia } = require('../../middleware/multerConfig');

router.post('/',uploadMedia.single("icon"), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
