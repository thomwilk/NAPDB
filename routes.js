const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://127.0.0.1:27017/?directConnection=true";

var { CreditModel } = require("./schemas/CreditSchema.cjs");
var { EpisodeModel } = require("./schemas/EpisodeSchema.cjs");

const pug = require("pug");
const indexFunction = pug.compileFile("./src/views/index.pug");
const producerFunction = pug.compileFile("./src/views/producer.pug");
const episodeFunction = pug.compileFile("./src/views/episode.pug");
const searchFunction = pug.compileFile("./src/views/search.pug");

async function last_ten_episodes() {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  await client.connect();
  const episodes = await client
    .db("NAPDB")
    .collection("episodes")
    .find()
    .sort({ _id: -1 })
    .limit(10)
    .toArray();
  await client.close();
  return episodes;
}

async function last_ten_credits() {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  await client.connect();
  const credits = await client
    .db("NAPDB")
    .collection("credits")
    .find()
    .sort({ _id: -1 })
    .limit(10)
    .toArray();
  await client.close();
  return credits;
}

async function producer_credits(alias) {
  if (alias === undefined) alias = ""
  if (alias.indexOf("getalby.com") > -1) {
    let arr = alias.split(" ");
    arr.pop();
    alias = arr.join(" ");
    alias = alias.replace(/ -$/i, "");
  }
  const searchQuery = RegExp(".*" + alias + ".*", "i");
  const client = new MongoClient(uri, { useNewUrlParser: true });
  await client.connect();
  const credits = await client
    .db("NAPDB")
    .collection("credits")
    .find({ producer: searchQuery })
    .sort({ episode_number: -1 })
    .toArray();
  await client.close();
  return credits;
}

async function get_episode_info(ep_number) {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  await client.connect();
  const episode = await client
    .db("NAPDB")
    .collection("episodes")
    .findOne({ number: ep_number });
  await client.close();
  return episode;
}

async function top_twenty_producers() {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  await client.connect();
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

  await client.close();
  return producers;
}

async function search_collections(searchTerm) {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  try {
    await client.connect();
    const db = client.db("NAPDB");
    const credits_collection = db.collection("credits");
    const episode_collection = db.collection("episodes");

    await credits_collection.createIndex({ "$**": "text" });
    await episode_collection.createIndex({ "$**": "text" });

    const credit_results = await credits_collection.find({ $text: { $search: searchTerm } }).toArray();
    const episode_results = await episode_collection.find({ $text: { $search: searchTerm } }).toArray();

    return {credit_results, episode_results};
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (client) {
      client.close();
    }
  }
}


module.exports = function (app) {
  app.get("/", async (req, res) => {
    const episodes = await last_ten_episodes();
    const credits = await last_ten_credits();
    const producers = await top_twenty_producers();

    res.send(
      indexFunction({
        episodeCredits: episodes,
        recentCredits: credits,
        freqProducers: producers,
      })
    );
  });

  //==========================================================

  app.get("/search/:searchQuery?", async (req, res) => {
    const searchQuery = req.query.searchQuery;
    const searchResults = await search_collections(searchQuery)

    const producerCredits = searchResults.credit_results
    const episodeCredits = searchResults.episode_results

    
    for (const credit of producerCredits) {
      if(credit.episode_number === undefined) credit.episode_number = credit.epNum
      const episode = await get_episode_info(credit.episode_number);
      console.log(credit)
      producerCredits.push({
        producer: credit.producer,
        epNum: credit.episode_number,
        epTitle: episode.title,
        epDate: episode.date,
        credType: credit.type,
      });
    }
    
    for (const credit of episodeCredits) {
      const episode = await get_episode_info(credit.number);
      episodeCredits.push({
        episode_date: episode.date,
        episode_number: credit.episode_number,
        title: episode.title,
        episode_artist: episode.artist,
        producer: credit.producer,
        type: credit.type,
      });
    }
    
    res.send(
      searchFunction({
        searchQuery,
        producerCredits,
        episodeCredits,
      })
    );
  });

  app.get("/producer/:alias?", async (req, res) => {
    const alias = req.params.alias;
    const credits = await producer_credits(alias);
    let producerCredits = Array();

    for (const credit of credits) {
      const episode = await get_episode_info(credit.episode_number);
      producerCredits.push({
        producer: credit.producer,
        epNum: credit.episode_number,
        epTitle: episode.title,
        epDate: episode.date,
        credType: credit.type,
      });
    }

    res.send(
      producerFunction({
        producerCredits: producerCredits,
      })
    );
  });
};
