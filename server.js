var express = require("express");
var app = express();
const PORT = process.env.PORT || 3000;

var mongoose = require("mongoose");

require("./routes")(app);

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use(express.static(__dirname));
app.use(express.json());

app.listen(PORT, function () {
  console.log(`Node.js listening on port ${PORT}`);
});

process.on("SIGINT", () => {
  mongoose.connection.close().then(() => {
    console.log("MongoDB connection closed");
    process.exit();
  });
});
