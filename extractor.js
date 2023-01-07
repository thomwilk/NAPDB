
async function add_credit(credit) {
  const client = new MongoClient(uri, { useNewUrlParser: true })
  await client.connect()
  const exists = await client.db("NAPDB").collection("credits").findOne({ producer: credit.producer, type: credit.type, episode_number: credit.episode_number })
  if (exists !== null) return `Credit already saved`
  await client.db("NAPDB").collection("credits").insertOne(credit)
  await client.close()
  console.log(`${credit.type} producer credit saved for ${credit.producer}, Episode: ${credit.episode_number}`)
}

module.exports = {
  add_credit,
}
