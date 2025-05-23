const faqService = require("./faq.service");

exports.createFaq = async (req, res) => {
  try {
    const faq = await faqService.createFaq(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getFaqs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const faqs = await faqService.getFaqs(filter);
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFaqById = async (req, res) => {
  try {
    const faq = await faqService.getFaqById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const updated = await faqService.updateFaq(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "FAQ not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const deleted = await faqService.deleteFaq(req.params.id);
    if (!deleted) return res.status(404).json({ message: "FAQ not found" });
    res.json({ success: true, message: "FAQ deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
