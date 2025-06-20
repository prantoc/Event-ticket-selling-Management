const Contact = require('./contact.schema');

const createContact = async (data) => {
  return await Contact.create(data);
};

const getAllContacts = async () => {
  return await Contact.find();
};

module.exports = { createContact, getAllContacts };
