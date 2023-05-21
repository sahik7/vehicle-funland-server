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


    app.get("/vehicles", async (req, res) => {
      const { ToyName, limit,page, SubCategory, SellerEmail } = req.query;
      console.log(SubCategory);

      let query = {};

      if (ToyName) {
        query.ToyName = { $regex: ToyName, $options: "i" };
      }

      if(SubCategory){
        query={SubCategory: SubCategory}
      }
      if(SellerEmail){
        query={SellerEmail: SellerEmail}
      }

      try {
        let vehicles = [];
        const pageNumber = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 20;
        const skipCount = (pageNumber - 1) * itemsPerPage;

        vehicles = await vehicleCollection.find(query)
          .skip(skipCount)
          .limit(itemsPerPage)
          .toArray();

        res.json(vehicles);
      } catch (error) {
        console.log(error);
      }
    });







    app.get("/vehicles/:id", async (req, res) => {
      const vehicleId = req.params.id;

      try {
        const findResult = await vehicleCollection.findOne({ _id: new ObjectId(vehicleId) });
        res.send(findResult);
      } catch (error) {
        res.status(500).send("Internal server error");
      }
    });



    app.get("/vehicleCount", async (req, res) => {
      const productData = await vehicleCollection.estimatedDocumentCount();
      res.send({ productCount: productData })
    })



    app.post("/vehicles", async (req, res) => {
      const data = req.body;
      const insertResult = await vehicleCollection.insertOne(data);
      console.log(insertResult);
      res.send(insertResult);
    })


    app.put("/vehicles/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      console.log(updateData)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedVehicles = {
        $set: {
          Price: updateData.Price,
          AvailableQuantity: updateData.AvailableQuantity,
          Details: updateData.Details
        }
      }

      const updatedVehicle = await vehicleCollection.updateOne(filter, updatedVehicles, options);
      res.send(updatedVehicle);
    })



    app.delete("/vehicles/:id", async (req, res) => {
      const { id } = req.params;
      const deletedUser = await vehicleCollection.deleteOne({ _id: new ObjectId(id) });
      console.log(deletedUser);
      res.send(deletedUser)
    })




    // Send a ping to confirm a successful connection
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
})