require("dotenv").config({ path: "./.env"});

const { MongoClient } = require("mongodb");

let client;

async function init() {
  client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
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

async function producer_credits(query) {
  if (query === undefined) query = "";
  const queryAsNum = parseInt(query);
  if (query.indexOf("getalby.com") > -1) {
    let arr = query.split(" ");
    arr.pop();
    query = arr.join(" ");
    query = query.replace(/ -$/i, "");
  }
  const searchQuery = RegExp(query, "i");
  const credits = await client
    .db("NAPDB")
    .collection("credits")
    .find({
      $or: [
        { producer: { $regex: searchQuery } },
        { type: { $regex: searchQuery } },
        { episode_number: queryAsNum },
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

async function search_episodes(searchQuery) {
  const searchQ = RegExp(searchQuery, "i");
  const episodes = await client
    .db("NAPDB")
    .collection("episodes")
    .find({
      $or: [
        { number: parseInt(searchQuery) },
        { title: { $regex: searchQ } },
        { date: { $regex: searchQ } },
        { length: { $regex: searchQ } },
        { artist: { $regex: searchQ } },
      ],
    })
    .sort({ episode_number: -1 })
    .toArray();

  return episodes;
}

async function episode_credits(query) {
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
