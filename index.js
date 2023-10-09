const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middlewares
app.use(express.json());
app.use(cors());
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.obhdclo.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const runningCinemasCollections = client.db("cinematicDb").collection("runningcinemas");
        const upcommingCinemasCollections = client.db("cinematicDb").collection("upcommingcinemas");
        const selectedmoviesCollection = client.db("cinematicDb").collection("selectedmovies");

        // get running cinemas
        app.get("/runningcinemas", async (req, res) => {
            const result = await runningCinemasCollections.find().toArray();
            res.send(result);
        })

        // get upcomming cinemas
        app.get("/upcommingcinemas", async (req, res) => {
            const result = await upcommingCinemasCollections.find().toArray();
            res.send(result);
        })

        // post a mobie user select 
        app.post("/selectedmovies", async (req, res) => {
            try {
                const userData = req.body;
                const result = await selectedmoviesCollection.insertOne(userData);

                console.log("Movie data saved to MongoDB");

                res.status(200).json({ message: "Movie data saved to MongoDB", data: result.ops[0] });
            } catch (error) {
                res.status(500).json({ error: "Failed to save movie data to MongoDB" });
            }
        });

        // get all selected movies
        app.get("/selectedmovies", async (req, res) => {
            const result = await selectedmoviesCollection.find().toArray();
            res.send(result);
        })
        // get movies by email
        app.get('/selectedmovies/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await selectedmoviesCollection.find(query).toArray();

            res.send(result);
        });
        //update a movie to handle refund policy
        app.put('/selectedmovies/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedTicket = req.body;
            const newUpdatedTicket = {
                $set: {
                    movieName: updatedTicket.movieName,
                    movieImage: updatedTicket.movieImage,
                    releaseDate: updatedTicket.releaseDate,
                    language: updatedTicket.language,
                    type: updatedTicket.type,
                    bookingDate: updatedTicket.bookingDate,
                    userEmail: updatedTicket.userEmail,
                    quantity: updatedTicket.quantity,
                    totalTicketPrice: updatedTicket.totalTicketPrice,
                }
            }
            const result = await selectedmoviesCollection.updateOne(query, newUpdatedTicket, options);
            res.send(result)
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Cinematic server is runnig")
})

app.listen(port)