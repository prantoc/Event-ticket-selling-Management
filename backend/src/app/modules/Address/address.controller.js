const addressService = require('./address.service');

exports.loadBulkData = async (req, res) => {
  try {
    const result = await addressService.insertBulkCountries(req.body);
    res.status(201).json({ message: "Data inserted", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const countries = await addressService.getAllCountries();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCity = async (req, res) => {
  const { iso2, state, city } = req.body;
  try {
    const updated = await addressService.addCity(iso2, state, city);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addState = async (req, res) => {
  const { iso2, state } = req.body;
  try {
    const updated = await addressService.addState(iso2, state);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCity = async (req, res) => {
  const { iso2, state, oldCity, newCity } = req.body;
  try {
    const updated = await addressService.updateCity(iso2, state, oldCity, newCity);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
