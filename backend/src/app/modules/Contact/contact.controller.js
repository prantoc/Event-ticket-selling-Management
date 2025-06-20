const { contactSchema } = require("./contact.validation");
const ContactService = require("./contact.service");
const userService = require("../User/user.service");
const newMessageEmail = require("../../utils/newMessageEmail");

const create = async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    const { name, email, message } = req.body;
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const result = await ContactService.createContact(parsed.data);

    const allAdminsEmail = await userService.getSuperAdminEmails();
    for (const userEmail of allAdminsEmail) {
      await newMessageEmail(userEmail, name, email, message);
    }
    res
      .status(201)
      .json({ message: "Message sent successfully", data: result });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const messages = await ContactService.getAllContacts();
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll };
