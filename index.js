const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.rko4yag.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {
    const database = client.db("vehicleFunland");
    const vehicleCollection = database.collection("vehicles");
    await client.connect();


    app.get("/vehicles", async (req, res) => {
      let query = {};
      if (req.query.ToyName) {
        console.log(req.query.ToyName);
        query = { ToyName: { $regex: req.query.ToyName, $options: "i" } };
      }
      if (req.query.SubCategory) {
        query["SubCategory"] = req.query.SubCategory;
      }
      const limit = 20;
      const result = await vehicleCollection.find(query).limit(limit).toArray();
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('vehicle running')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
})