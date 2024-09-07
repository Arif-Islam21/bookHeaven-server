const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.knlt5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const booksCollection = client.db("bookHeaven").collection("books");
    const categoryCollection = client.db("bookHeaven").collection("category");
    const borrowCollection = client.db("bookHeaven").collection("borrow");

    app.get("/", (req, res) => {
      res.send("Book Is On the way");
    });

    app.get("/addedBooks", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });

    app.get("/bookCategory/:category", async (req, res) => {
      const bookCategory = req.params.category;
      const query = { category: bookCategory };
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoryCollection.findOne(query);
      res.send(result);
    });

    // borrow a book from the library
    app.post("/borrow/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const borrowData = req.body;
      // console.log(borrowData);
      const borrowResult = await borrowCollection.insertOne(borrowData);

      const updatedDoc = {
        $inc: {
          quantity: -1,
          "metrics.orders": 1,
        },
      };
      const result = await categoryCollection.updateOne(query, updatedDoc);
      res.send({ result, borrowResult });
    });

    // post add book data to the server
    app.post("/addBook", async (req, res) => {
      const data = req.body;
      if (typeof data.quantity === "string") {
        data.quantity = parseInt(data.quantity);
      }
      console.log(data);
      const result = await categoryCollection.insertOne(data);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
