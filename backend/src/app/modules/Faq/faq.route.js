const express = require("express");
const router = express.Router();
const faqController = require("./faq.controller");
const auth = require("../../middleware/auth");

router.post("/", auth("superAdmin", "admin"), faqController.createFaq);
router.get("/", faqController.getFaqs);
router.get("/:id", faqController.getFaqById);
router.put("/:id", auth("superAdmin", "admin"), faqController.updateFaq);
router.delete("/:id", auth("superAdmin", "admin"), faqController.deleteFaq);

module.exports = router;
