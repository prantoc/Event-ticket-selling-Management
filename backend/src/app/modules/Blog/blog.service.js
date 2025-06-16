const QueryBuilder = require("../../builder/QueryBuilder");
const { getPresignedUrl } = require("../../utils/formatMinioUrl");
const Blog = require("./blog.schema");

exports.createBlog = async (data) => {
  return await Blog.create(data);
};

exports.getAllBlogs = async (query) => {
  const builder = new QueryBuilder(Blog.find().populate("category"), query)
    .search(["title", "content"])
    .filter(["category", "isPublished"])
    .sort()
    .paginate();

  const blogs = await builder.modelQuery;
  const meta = await builder.countTotal();

  // Add presigned URLs for featuredImage
  const blogsWithUrls = await Promise.all(
    blogs.map(async (blog) => {
      const blogObj = blog.toObject(); // Ensure it's plain JS object if needed
      if (blog.featuredImage) {
        blogObj.featuredImage = await getPresignedUrl(blog.featuredImage, "blogs");
      }
      return blogObj;
    })
  );

  return { blogs: blogsWithUrls, meta };
};


exports.getBlogById = async (id) => {
  return await Blog.findById(id).populate("category");
};
exports.getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({
    slug,
    isPublished: true,
  }).populate("category");

  if (blog.featuredImage) {
    blog.featuredImage = await getPresignedUrl(blog.featuredImage, "blogs");
  }
  return blog;
};

exports.updateBlog = async (id, updateData, featuredImage) => {
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new Error("Blog not found");
  }

  // Update fields from updateData
  Object.assign(blog, updateData);

  // Conditionally update featured image
  if (featuredImage) {
    blog.featuredImage = featuredImage.name; // or `featuredImage.url`, etc.
  }

  await blog.save();
  return blog;
};

exports.deleteBlog = async (id) => {
  return await Blog.findByIdAndDelete(id);
};
