const mongoose = require("mongoose");
const env = require("./env");

const connectMongo = async () => {
  // Keep strictQuery explicit so query behavior is predictable.
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
};

module.exports = {
  connectMongo,
  mongoose
};
