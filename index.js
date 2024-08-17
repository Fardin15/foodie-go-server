const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

console.log(process.env.MONGO_USERNAME);
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.lnrcai2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // database collection
    const productsCollection = client.db("mhStoreDb").collection("products");
    const categoryCollection = client.db("mhStoreDb").collection("category");

    // get api for category
    app.get("/category", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    // get api for products
    app.get("/products", async (req, res) => {
      const {
        page = 1,
        limit = 8,
        sortBy = "price",
        order = "asc",
        search = "",
        category,
        brand,
        minPrice,
        maxPrice,
      } = req.query;

      // pagination
      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const filter = {};

      // Handle category filtering
      if (category && category !== "all") {
        filter.category = category;
      }
      // Handle brand filtering
      if (brand) filter.brand = brand;
      // Handle search filtering
      if (search) filter.productName = { $regex: search, $options: "i" };

      // Handle price range filtering
      // if (minPrice || maxPrice) {
      //   filter.price = {};
      //   if (minPrice) filter.price.$gte = parseFloat(minPrice);
      //   if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      // }

      // const products = await productsCollection
      //   .find(filter)
      //   .sort({ [sortBy]: sortOrder })
      //   .skip(skip)
      //   .limit(parseInt(limit))
      //   .toArray();

      // const total = await productsCollection.countDocuments(filter);

      // res.json({
      //   totalPages: Math.ceil(total / limit),
      //   currentPage: parseInt(page),
      //   products,
      // });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Foodie go server is running");
});

app.listen(port, () => {
  console.log(`Foodie go Server is running on port ${port}`);
});
