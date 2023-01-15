const { default: mongoose } = require('mongoose')

const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb://127.0.0.1:27017/?directConnection=true'

async function add_credit(credit) {
  console.log(credit)
  const client = new MongoClient(uri, { useNewUrlParser: true })
  await client.connect()
  const exists = await client.db("NAPDB").collection("credits").findOne({ producer: credit.producer, type: credit.type, episode_number: credit.episode_number })
  if (exists !== null) return `Credit already saved`
  await client.db("NAPDB").collection("credits").insertOne(credit)
  await client.close()
  console.log(`${credit.type} producer credit saved for ${credit.producer}, Episode: ${credit.episode_number}`)
}

async function add_episode(episode) {
  const client = new MongoClient(uri, { useNewUrlParser: true })
  await client.connect()
  const exists = await client.db("NAPDB").collection("episodes").findOne({ number: { $eq: episode.number } })
  if (exists !== null) return `Episode number ${episode.number} already saved`
  await client.db("NAPDB").collection("episodes").insertOne(episode)
  await client.close()
  console.log(`Episode ${episode.number}: ${episode.title} saved`)
}

async function last_episode_saved() {
  const client = new MongoClient(uri, { useNewUrlParser: true })
  await client.connect()
  const last_episode_saved = await client.db("NAPDB").collection("episodes").find().sort({ number: 1 }).toArray()
  await client.close()
  return last_episode_saved[last_episode_saved.length-1].number
}

async function exportFunctions() {
  module.exports = {
    add_credit,
    add_episode,
    last_episode_saved,
  }
}
exportFunctions();