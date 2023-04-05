const { trim } = require("jquery");
const { default: mongoose } = require("mongoose");
require("dotenv").config({ path: "./.env"});
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });

async function add_credit(credit) {
  if (credit.producer.trim() == "") return;
  await client.connect();
  const exists = await client
    .db("NAPDB")
    .collection("credits")
    .findOne({
      producer: credit.producer,
      type: credit.type,
      episode_number: credit.episode_number,
    });
  if (exists !== null) return `Credit already saved`;
  if (credit.type == "Artist" && credit.producer.indexOf("getalby.com") > -1) {
    let arr = credit.producer.split(" ");
    credit.cryptoAddress = arr[arr.length - 1];
    arr.pop();
    credit.producer = arr.join(" ");
    credit.producer = credit.producer.replace(/ -$/, "");
  }
  await client.db("NAPDB").collection("credits").insertOne(credit);
  await client.close();
  console.log(
    `${credit.type} producer credit saved for ${credit.producer}, Episode: ${credit.episode_number}`
  );
}

async function add_episode(episode) {
  await client.connect();
  const exists = await client
    .db("NAPDB")
    .collection("episodes")
    .findOne({ number: { $eq: episode.number } });
  if (exists !== null) return `Episode number ${episode.number} already saved`;
  await client.db("NAPDB").collection("episodes").insertOne(episode);
  await client.close();
  console.log(`Episode ${episode.number}: ${episode.title} saved`);
}

async function last_episode_saved() {
  await client.connect();
  const last_episode_saved = await client
    .db("NAPDB")
    .collection("episodes")
    .find()
    .sort({ number: 1 })
    .toArray();
  await client.close();
  return last_episode_saved[last_episode_saved.length - 1].number;
}

async function exportFunctions() {
  module.exports = {
    add_credit,
    add_episode,
    last_episode_saved,
  };
}
exportFunctions();
