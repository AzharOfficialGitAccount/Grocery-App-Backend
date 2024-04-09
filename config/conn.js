
const mongoose = require('mongoose');
const URL = process.env.URL;

const connection = mongoose.connect(URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);

  });

module.exports = connection;