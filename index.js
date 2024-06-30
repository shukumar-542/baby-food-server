const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

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
        const userCollection = db.collection('users');
        const orderCollection = db.collection('order');


        // User Registration
        app.post('/api/v1/register', async (req, res) => {
            const { name, email, password } = req.body;

            // Check if email already exists
            const existingUser = await userCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            await userCollection.insertOne({ name, email, password: hashedPassword, role: 'user' });

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });
        });



        // User Login
        app.post('/api/v1/login', async (req, res) => {
            const { email, password } = req.body;

            // Find user by email
            const user = await userCollection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });

            res.json({
                success: true,
                message: 'Login successful',
                token
            });
        });


        // Update User information
        app.patch('/api/v1/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updateUser = req.body;
            const user = {
                $set: {
                    ...updateUser
                }
            }
            const result = await userCollection.updateOne(query, user)
            res.json(result)

        })


        // Get user Information

        app.get('/api/v1/userInfo/:email', async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.findOne({ email: email })
            res.json(result)

        })





        // ----------inset data into database-------------
        app.post('/api/v1/product', async (req, res) => {
            const body = req.body
            const products = { 'creationTime': new Date(), ...body, 'quantity': 0 }
            const result = await productCollection.insertOne(products);
            res.json(result)
        })



        // create order collection
        app.post('/api/v1/order', async (req, res) => {
            const body = req.body
            const product = { stats: 'pending', ...body }
            const result = await orderCollection.insertOne(product)
            res.json(result)
        })


        // Get all orders
        app.get('/api/v1/order', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.json(result)
        })

        // Update order status
        app.patch('/api/v1/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: { stats: 'delivered' }
            }
            const result = await orderCollection.updateOne(query, updateDoc)
            res.send(result)
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

        // delete product by ID
        app.delete('/api/v1/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.json(result)
        })

        // update products 
        // -----------update data form database-----------//
        app.patch('/api/v1/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updateProduct = req.body;
            const products = {
                $set: {
                    ...updateProduct
                }
            }
            const result = await productCollection.updateOne(query, products)
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