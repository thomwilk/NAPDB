const pug = require("pug");
const indexFunction = pug.compileFile("./src/views/index.pug");
const producerFunction = pug.compileFile("./src/views/producer.pug");
const episodeFunction = pug.compileFile("./src/views/episode.pug");
const searchFunction = pug.compileFile("./src/views/search.pug");

module.exports = {
  indexFunction,
  producerFunction,
  episodeFunction,
  searchFunction,
};
