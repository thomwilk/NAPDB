const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://127.0.0.1:27017/?directConnection=true';

async function updateProducerInCredits() {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  try {
    await client.connect();
    const db = client.db('NAPDB');
    const collection = db.collection('credits');
    const updateResult = await collection.updateMany(
      { "producer": { $regex: / -$/ } },
      { $set: { "producer": { $substr: ["$producer", 0, -2] } } }
    );
    console.log(`${updateResult.matchedCount} document(s) matched the query criteria.`);
    console.log(`${updateResult.modifiedCount} document(s) was/were updated.`);
  } finally {
    await client.close();
  }
}

updateProducerInCredits()