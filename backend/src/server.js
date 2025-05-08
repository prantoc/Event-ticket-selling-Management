const mongoose = require('mongoose');
const app = require('./app');
const config = require('./app/config/index');

async function main() {
  try {
    await mongoose.connect(config.database_url);
    console.log('database is connected');
    app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
