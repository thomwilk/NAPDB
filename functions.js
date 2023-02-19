const uri = "mongodb://127.0.0.1:27017/?directConnection=true";
const { MongoClient } = require("mongodb");

let client;

async function init() {
  client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect();
  console.log("Connected to MongoDB");
}

init();

async function last_ten_episodes() {
  const episodes = await client
    .db("NAPDB")
    .collection("episodes")
    .find()
    .sort({ _id: -1 })
    .limit(10)
    .toArray();
  return episodes;
}

async function last_ten_credits() {
  const credits = await client
    .db("NAPDB")
    .collection("credits")
    .find()
    .sort({ _id: -1 })
    .limit(10)
    .toArray();
  return credits;
}

async function producer_credits(alias) {
  if (alias === undefined) alias = "";
  if (alias.indexOf("getalby.com") > -1) {
    let arr = alias.split(" ");
    arr.pop();
    alias = arr.join(" ");
    alias = alias.replace(/ -$/i, "");
  }
  const searchQuery = RegExp(alias, "i");
  const credits = await client
    .db("NAPDB")
    .collection("credits")
    .find({
      $or: [
        { producer: { $regex: searchQuery } },
        { type: { $regex: searchQuery } },
        { episode_number: parseInt(searchQuery) },
      ],
    })
    .sort({ episode_number: -1 })
    .toArray();
  return credits;
}

async function search_credits(searchQuery) {
  const searchTerm = RegExp(/searchQuery/, "i");

  const producerCredits = await producer_credits(searchTerm)
  
  const episodeCredits = await episode_credits(searchTerm)

  return { searchQuery, episodeCredits, producerCredits }
}

async function search_episodes(query) {
  const searchQuery = RegExp(/query/, "i");
  const episodes = await client
    .db("NAPDB")
    .collection("episodes")
    .find({
      $or: [
        { number: parseInt(query) },
        { title: { $regex: searchQuery } },
        { date: { $regex: searchQuery } },
        { length: { $regex: searchQuery } },
        { artist: { $regex: searchQuery } },
      ],
    })
    .sort({ episode_number: -1 })
    .toArray();

  return episodes;
}

async function episode_credits(query) {
  await client
    .db("NAPDB")
    .collection("credits")
    .createIndex({ producer: 1, type: 1, episode_number: -1 });
  const episodes = await client
    .db("NAPDB")
    .collection("credits")
    .find({
      $or: [
        { producer: { $regex: /query/, $options: "i" } },
        { type: { $regex: /query/, $options: "i" } },
        { episode_number: parseInt(query) },
      ],
    })
    .sort({ episode_number: -1 })
    .toArray();
  return episodes;
}

async function top_twenty_producers() {
  const producers = await client
    .db("NAPDB")
    .collection("credits")
    .aggregate([
      { $match: { producer: { $exists: true, $ne: "" } } },
      { $match: { producer: { $exists: true, $ne: "Anonymous" } } },
      { $group: { _id: "$producer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ])
    .toArray();
  return producers;
}

async function get_episode_info(ep_number) {
  const episode = await client
    .db("NAPDB")
    .collection("episodes")
    .findOne({ number: ep_number });
  return episode;
}

module.exports = {
  last_ten_credits,
  last_ten_episodes,
  producer_credits,
  episode_credits,
  get_episode_info,
  top_twenty_producers,
  search_credits,
  search_episodes,
};
