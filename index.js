const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
// const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");


        const db = client.db('baby-food');
        const productCollection = db.collection('products');


        // ----------inset data into database-------------
        app.post('/api/v1/product', async (req, res) => {
            const body = req.body
            const products = { 'creationTime': new Date(), ...body }
            const result = await productCollection.insertOne(products);
            res.json(result)
        })


        // Get all Products
        app.get('/api/v1/product', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.json(result)
        })

        // get flash sale product
        app.get('/api/v1/flashSale', async (req, res) => {
            const result = await productCollection.find({ flashSale: true }).toArray()
            res.json(result)
        })

        // Get to rated product
        app.get('/api/v1/top-rating', async (req, res) => {
            const result = await productCollection.find().sort({ rating: -1 }).toArray()
            res.json(result)

        })

        // get product searching by Id
        app.get('/api/v1/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.json(result)
        })

        // Get products by category
        app.get('/api/v1/category/:category', async (req, res) => {
            const category = req.params.category;
            const result = await productCollection.find({ category: category }).toArray()
            res.json(result)

        })
        // Get products by rating
        app.get('/api/v1/rating/:rating', async (req, res) => {
            const rating = req.params.rating;
            const result = await productCollection.find({ rating: Number(rating) }).toArray()
            res.json(result)

        })

        // Get products by price range
        app.get('/api/v1/price/:minPrice/:maxPrice', async (req, res) => {
            const minRating = Number(req.params.minPrice);
            const maxRating = Number(req.params.maxPrice);

            const result = await productCollection.find({
                price: { $gte: minRating, $lte: maxRating }
            }).toArray();

            res.json(result);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on `);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running smoothly',
        timestamp: new Date()
    };
    res.json(serverStatus);
});