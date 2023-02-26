require("dotenv").config({ path: "./.env" });
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI;

async function updateProducerInCredits() {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  try {
    await client.connect();
    const db = client.db('NAPDB');
    const collection = db.collection('credits');
    const updateResult = await collection.updateMany(
      { "episode_number": 1531, "type": "Artist" },
      { $set: { "producer": "Nessworks" } }
    );
    console.log(`${updateResult.matchedCount} document(s) matched the query criteria.`);
    console.log(`${updateResult.modifiedCount} document(s) was/were updated.`);
  } finally {
    await client.close();
  }
}

async function deleteProducerCredits(episode_number) {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  try {
    await client.connect();
    const db = client.db('NAPDB');
    const collection = db.collection('credits');
    const updateResult = await collection.deleteMany(
      { "episode_number": episode_number },
    );
    console.log(`${updateResult.matchedCount} document(s) matched the query criteria.`);
    console.log(`${updateResult.modifiedCount} document(s) was/were deleted.`);
  } finally {
    await client.close();
  }
}

async function deleteEpisodeCredits(episode_number) {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  try {
    await client.connect();
    const db = client.db('NAPDB');
    const collection = db.collection('episodes');
    const updateResult = await collection.deleteOne(
      { "number": episode_number },
    );
    console.log(`${updateResult.matchedCount} document(s) matched the query criteria.`);
    console.log(`${updateResult.modifiedCount} document(s) was/were deleted.`);
  } finally {
    await client.close();
  }
}

//updateProducerInCredits()

deleteProducerCredits(1532)
deleteEpisodeCredits(1532)