const Faq = require("./faq.schema");

exports.createFaq = async (data) => {
  return await Faq.create(data);
};

exports.getFaqs = async (filter = {}) => {
  return await Faq.find(filter);
};

exports.getFaqById = async (id) => {
  return await Faq.findById(id);
};

exports.updateFaq = async (id, data) => {
  return await Faq.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteFaq = async (id) => {
  return await Faq.findByIdAndDelete(id);
};
