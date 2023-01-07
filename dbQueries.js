const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb://127.0.0.1:27017/?directConnection=true'

async function dbQuery() {
    const client = new MongoClient(uri, { useNewUrlParser: true })
    await client.connect()
    const query = await client.db("NAPDB").collection("credits")
        .updateMany(
            { "producer": "!Missing!" },
            {
                $set: { "producer": "" }
        })
    await client.close()
    return 0
}

//dbQuery()