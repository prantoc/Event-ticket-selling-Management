const QueryBuilder = require("../../builder/QueryBuilder");
const BlogService = require("./blog.service");

exports.createBlog = async (req, res) => {
  try {
    const featuredImage = req.minioFiles.featuredImage?.[0];
    const contentImages = req.body.content.replace(
      /src="data:image[^"]+"/g,
      (match) => {
        // Optionally rewrite base64 inline images to URL paths if stored
        return match; // Placeholder for any transformation if needed
      }
    );

    const newBlog = await BlogService.createBlog({
      ...req.body,
      featuredImage,
      content: contentImages,
    });

    res.status(201).json({ success: true, data: newBlog });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: err.message,
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const result = await BlogService.getAllBlogs(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: err.message,
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await BlogService.getBlogById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: err.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    // Check if new featured image is uploaded
    const featuredImage = req.minioFiles?.featuredImage?.[0] || null;

    // Pass featuredImage to the service layer — null means "no change"
    const updated = await BlogService.updateBlog(
      req.params.id,
      req.body,
      featuredImage
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: err.message,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await BlogService.deleteBlog(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: err.message,
    });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogService.getBlogBySlug(req.params.slug);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: err.message,
    });
  }
};

exports.uploadEditorImage = async (req, res) => {
  try {
    const image = req.minioFiles ? req.minioFiles.image : null;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    const imageUrl = `${process.env.MINIO_PUBLIC_URL}/blogs/${image}`;

    res.status(200).json({
      success: true,
      url: imageUrl, // editors like Quill/TinyMCE use this URL to embed the image
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to upload editor image",
      error: err.message,
    });
  }
};
