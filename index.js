const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const { getAllUsers } = require('./controllers/getUsersController');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


client.connect((err) => {
    if(err) {
        console.log(err);
        return;
    } else {
        // our database is connected successfully
        const db = client.db("test");
        const usersCollection = db.collection('users');
        // Routes
        app.get("/users", auth, getAllUsers)

        app.get("/p-users", async(req, res) => {
            /**
             * 1. take query params from user -> limit, page
             * 2. run query
             */
            console.log('p-users');
            const limit = Number(req.query.limit) || 10;
            const page = Number(req.query.page) || 1;

            console.log(req.query);

            const users = await usersCollection
                            .find({})
                            .limit(limit)
                            .skip(limit * page)
                            .toArray();

            res.send({
                status: "success",
                data: users
            })

        })  

        app.post("/user/create", async(req, res) => {
            const user = await db.collection("users").insertOne({
                name: 'tamim',
                email: 'tamim2@gmail.com',
                password: "123456"
            });

            res.send({
                status: "success",
                data: user
            });
        });

        // registration
        app.post('/register', async(req, res) => {
            const {name, email, password} = req.body;

            const usersCollection = db.collection("users");

            const user = await usersCollection.insertOne({
                name,
                email,
                password
            });

            res.send({
                status: "success",
                data: user
            });
        })

        // login
        app.post("/login", async(req, res) => {
            const {email, password} = req.body;

            // 1. validate body for jwt
            if(!email || !password) {
                return res.send({
                    status: "error",
                    message: "Provide all the value"
                })
            }

            // const user = await db.collection('users').findOne({email, password}); 

            // 2. find a user for jwt
            const usersCollection = db.collection("users");
            const user = await usersCollection.findOne({
                email: email,
            })


            // 3. if user not found, send invalid error response
            if(!user) {
                return res.send({
                    status: "error",
                    message: "user doesn't exist"
                })
            }

            const isPasswordCorrectUser = await usersCollection.findOne({
                email: email,
                password: password
            })

            if(!isPasswordCorrectUser) {
                return res.send({
                    status: "error",
                    message: "user doesn't exist"
                })
            }

            // 1. validate body
            // 2. find the user
            // 3. if user not found, send invalid error response
            // 4. create token
            // 6. send response

            const tokenObj = {
                email: isPasswordCorrectUser.email,
                id: isPasswordCorrectUser._id
            }

            const token = jwt.sign(tokenObj, process.env.JWT_SECRET)

            res.send({
                status: "success",
                data: tokenObj,
                token: token
            })
        })

    }
})

app.get('/test', (req, res) => {
    res.json({
        message: `It's working`
    })
})

app.listen(port, ()=> {
    client.connect((err) => {
        if(err) {
            console.log(err);
        } else {
            console.log('connected to Mongodb');
        }
    })
    console.log('server is running ', port);
})