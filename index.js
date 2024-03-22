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
        const test = db.collection('new');
        

        // ----------inset data into database-------------
        app.post('/api/v1/product', async (req, res) => {
            const body = req.body
            const products = { 'creationTime' : new Date() , ...body }
            const result = await productCollection.insertOne(products);
            res.json(result)
        })


        // Get all Products
        app.get('/api/v1/product', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.json(result)
        })

        
        app.get('/api/v1/flashSale', async (req, res) => {
            const result = await productCollection.find({ flashSale: true }).toArray()
            res.json(result)
        })

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