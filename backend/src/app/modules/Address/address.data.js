const mongoose = require('mongoose');
const Country = require('./address.model');
const data = require('./address.seed.json');
const { database_url } = require('../../config');

// MongoDB URL — change as needed
const MONGODB_URI = database_url;

async function seedAddressData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    await Country.deleteMany(); // clear old data
    console.log('Old address data removed.');

    const result = await Country.insertMany(data);
    console.log(`Inserted ${result.length} countries.`);

    process.exit(0); // Exit after seeding
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seedAddressData();
