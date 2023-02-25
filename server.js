require("dotenv").config({ path: "./.env" });
const { MongoClient } = require("mongodb");
var express = require("express");
var mongoose = require("mongoose");
var app = express();
const PORT = process.env.PORT || 80;

mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    const conn = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true });
    console.log(`MongoDB Connected`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

require("./routes")(app);

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use(express.static(__dirname));
app.use(express.json());

connectDB().then(() => {
  app.listen(PORT, function () {
    console.log(`Node.js listening on port ${PORT}`);
  });
});

process.on("SIGINT", () => {
  mongoose.connection.close().then(() => {
    console.log("MongoDB connection closed");
    process.exit();
  });
});
