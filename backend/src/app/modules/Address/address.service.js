const Country = require('./address.model');

// Add multiple countries (bulk insert)
async function insertBulkCountries(data) {
  await Country.deleteMany(); // clear first if needed
  return await Country.insertMany(data);
}

// Get all countries
async function getAllCountries() {
  return await Country.find({});
}

// Add a city to a specific state in a country
async function addCity(iso2, stateName, cityName) {
  return await Country.findOneAndUpdate(
    { iso2, "states.name": stateName },
    { $push: { "states.$.cities": { name: cityName } } },
    { new: true }
  );
}

// Add a new state
async function addState(iso2, stateName) {
  return await Country.findOneAndUpdate(
    { iso2 },
    { $push: { states: { name: stateName, cities: [] } } },
    { new: true }
  );
}

// Update a city
async function updateCity(iso2, stateName, oldCityName, newCityName) {
  return await Country.updateOne(
    { iso2, "states.name": stateName, "states.cities.name": oldCityName },
    { $set: { "states.$[s].cities.$[c].name": newCityName } },
    {
      arrayFilters: [
        { "s.name": stateName },
        { "c.name": oldCityName }
      ]
    }
  );
}

module.exports = {
  insertBulkCountries,
  getAllCountries,
  addCity,
  addState,
  updateCity
};
