const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb://127.0.0.1:27017/?directConnection=true'

var { CreditModel } = require('./schemas/CreditSchema.cjs')
var { EpisodeModel } = require('./schemas/EpisodeSchema.cjs')

const pug = require('pug')
const indexFunction = pug.compileFile('./src/views/index.pug');
const producerFunction = pug.compileFile('./src/views/producer.pug');
const episodeFunction = pug.compileFile('./src/views/episode.pug');

var tablesort = require('tablesort')

async function last_ten_episodes() {
    const client = new MongoClient(uri, { useNewUrlParser: true })
    await client.connect()
    const episodes = await client.db("NAPDB").collection("episodes")
        .find()
        .sort({ _id: -1 })
        .limit(10)
        .toArray()
    await client.close()
    return episodes
}
  
async function last_ten_credits() {
    const client = new MongoClient(uri, { useNewUrlParser: true })
    await client.connect()
    const credits = await client.db("NAPDB").collection("credits")
        .find()
        .sort({ _id: -1 })
        .limit(10)
        .toArray()
    await client.close()
    return credits
}
  
async function producer_credits(alias) {
    const searchQuery = RegExp(".*" + alias + ".*", "i")
    const client = new MongoClient(uri, { useNewUrlParser: true })
    await client.connect()
    const credits = await client.db("NAPDB").collection("credits")
        .find({ producer: searchQuery})
        .sort({ episode_number: -1 })
        .toArray()
    await client.close()
    return credits
}

async function episode_credits(query) {
    const client = new MongoClient(uri, { useNewUrlParser: true })
    await client.connect()
    await client.db("NAPDB").collection("episodes").createIndex({ title: 1, artist: 1 })
    const episodes = await client.db("NAPDB").collection("episodes")
        .find({ $or: [{ title: { $regex : query, $options: 'i' } }, { artist: { $regex : query, $options: 'i' } }, { number: parseInt(query) }] })
        .sort({field1: 1})
        .toArray()
    await client.close()
    return episodes
}

async function get_episode_info(ep_number) {
    const client = new MongoClient(uri, { useNewUrlParser: true })
    await client.connect()
    const episode = await client.db("NAPDB").collection("episodes").findOne({ number: ep_number })
    await client.close()
    return episode
  }
  
  async function top_ten_producers() {
      const client = new MongoClient(uri, { useNewUrlParser: true })
      await client.connect()
      const producers = await client.db("NAPDB").collection("credits")
    .aggregate([
        { $group: { _id: "$producer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ])
    .toArray()
      
      await client.close()
      return producers
    }

module.exports = function (app) {

    app.get('/', async (req, res) => {
        const episodes = await last_ten_episodes()
        const credits = await last_ten_credits()
        const producers = await top_ten_producers()
        
        res.send(indexFunction({
            episodeCredits: episodes,
            recentCredits: credits,
            freqProducers: producers
        }))
    })
    
    //==========================================================

    app.get('/producer/:alias?', async (req, res) => {
        const alias = req.params.alias
        const credits = await producer_credits(alias)
        let producerCredits = Array();

        for (const credit of credits) {
            const episode = await get_episode_info(credit.episode_number)
            producerCredits.push({ "producer": credit.producer, "epNum": credit.episode_number, "epTitle": episode.title, "epDate": episode.date, "credType": credit.type })
        }

        res.send(producerFunction({
            "producerCredits": producerCredits,
        }))
    })
    
    //==========================================================

    app.get('/episode/:searchQuery?', async (req, res) => {
        const searchQuery = req.params.searchQuery
        const credits = await episode_credits(searchQuery)
        let episodeCredits = Array();

        for (const credit of credits) {
            episodeCredits.push({ "epNumber": credit.number, "epTitle": credit.title, "epDate": credit.date, "epLength": credit.length, "epArtist": credit.artist })
        }

        res.send(episodeFunction({
            "episodeCredits": episodeCredits,
        }))
    })
}