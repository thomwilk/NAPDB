const uri = "mongodb://127.0.0.1:27017/?directConnection=true"

async function connect() {
  const MongoClient = require("mongodb").MongoClient;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  await client.connect();
  return client;
}

module.exports = { connect, uri };
