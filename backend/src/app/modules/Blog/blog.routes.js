const router = require("express").Router();
const uploadMinio = require("../../middleware/uploadMinio");
const blogController = require("./blog.controller");

router.post(
  "/",
  uploadMinio({
    type: "fields",
    fields: [{ name: "featuredImage", maxCount: 1 }],
    bucket: "blogs",
  }),
  blogController.createBlog
);

router.get("/", blogController.getAllBlogs);
router.post(
  "/blog-image",
  uploadMinio({ type: "single", name: "image", bucket: "blogs" }),
  blogController.uploadEditorImage
);
router.get("/:slug", blogController.getBlogBySlug);
router.get("/:id", blogController.getBlogById);
router.put(
  "/:id",
  uploadMinio({
    type: "fields",
    fields: [{ name: "featuredImage", maxCount: 1 }],
    bucket: "blogs",
  }),
  blogController.updateBlog
);
router.delete("/:id", blogController.deleteBlog);

module.exports = router;
