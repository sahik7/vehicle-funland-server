const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
      if (req.query.SellerEmail) {
        query.SellerEmail = req.query.SellerEmail
      }
      if (req.query.ToyName) {
        console.log(req.query.ToyName);
        query = { ToyName: { $regex: req.query.ToyName, $options: "i" } };
      }
      if (req.query.SubCategory) {
        query["SubCategory"] = req.query.SubCategory;
      }
      const findResult = await vehicleCollection.find(query).toArray();
      res.send(findResult);
    });







    app.get("/vehicles/:id", async (req, res) => {
      const vehicleId = req.params.id;

      try {
        const findResult = await vehicleCollection.findOne({ _id: new ObjectId(vehicleId) });
        console.log(findResult);
        res.send(findResult);
        //   if (findResult) {
        //     console.log(findResult);
        //   } else {
        //     res.status(404).send("Vehicle not found");
        //   }
      } catch (error) {
        res.status(500).send("Internal server error");
      }
    });







    app.post("/vehicles", async (req, res) => {
      const data = req.body;
      const insertResult = await vehicleCollection.insertOne(data);
      console.log(insertResult)
      res.send(insertResult);
    })


    app.put("/vehicles/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
console.log(updateData)
      const filter = {_id: new ObjectId(id)}
      const options =  {upsert: true}
      const updatedVehicles = {
$set:{
  Price: updateData.Price,
  AvailableQuantity: updateData.AvailableQuantity,
  Details: updateData.Details
}
      }

        const updatedVehicle = await vehicleCollection.updateOne(filter, updatedVehicles, options);
      console.log(updatedVehicle)
      res.send(updatedVehicle);
    })




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