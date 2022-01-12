const { MongoClient } = require('mongodb')
const uri = process.env.db_uri
const options = {
   useUnifiedTopology: true,
   useNewUrlParser: true,
}
let client
let clientPromise
client = new MongoClient(uri, options)
clientPromise = client.connect()
export default clientPromise