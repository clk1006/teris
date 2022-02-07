const { MongoClient } = require('mongodb');
require("dotenv").config()
const uri = process.env.db_uri
const options = {
   useUnifiedTopology: true,
   useNewUrlParser: true,
};
let client=new MongoClient(uri, options);
let clientPromise = client.connect();
module.exports = clientPromise;