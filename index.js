const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bwvhp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const postCollection = client.db("assignment").collection("postCollection");
    const userCollection = client.db("assignment").collection("userCollection");

    //   user collection
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
      console.log(users);
    });

    // post collection for post in the client site
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/posts", async (req, res) => {
      const query = {};
      const posts = await postCollection.find(query).toArray();
      res.json(posts);
    });

    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.json(result);
    });

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const post = await postCollection.findOne(query);
      res.json(post);
    });

    app.post("/posts/:id/reaction", async (req, res) => {
      try {
        const postId = req.params.id;
        const { reactionType } = req.body;

        const result = await postCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $inc: { [`reactions.${reactionType}`]: 1 } }
        );
        // console.log(result);
        res.json({ success: true, message: "Reaction added successfully" });
      } catch (error) {
        console.error("Error adding reaction:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to add reaction" });
      }
    });

    app.post("/posts/:id/comment", async (req, res) => {
      try {
        const postId = req.params.id;
        const { comment } = req.body;

        const result = await postCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $push: { comments: comment } }
        );
        // console.log(result);

        res.json({ success: true, message: "Comment added successfully" });
      } catch (error) {
        console.error("Error adding comment:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to add comment" });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is  running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
