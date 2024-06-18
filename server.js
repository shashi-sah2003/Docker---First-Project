const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', (req, res) => {
    const img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
    res.writeHead(200, { 'Content-Type': 'image/jpg' });
    res.end(img, 'binary');
});

// Use when starting application locally
const mongoUrlLocal = "mongodb://localhost:27017/";

// Use when starting application as docker container
const mongoUrlDocker = "mongodb://admin:password@mongodb";

// "user-account" in demo with docker. "my-db" in demo with docker-compose
const databaseName = "my-db";

app.post('/update-profile', async (req, res) => {
    const userObj = req.body;
    const mongoUrl = process.env.DOCKER ? mongoUrlDocker : mongoUrlLocal;

    try {
        const client = await MongoClient.connect("mongodb://admin:password@localhost:27017");
        const db = client.db('user-account');
        userObj['userid'] = 1;

        const myquery = { userid: 1 };
        const newvalues = { $set: userObj };

        await db.collection("users").updateOne(myquery, newvalues, { upsert: true });
        client.close();

        // Send response
        res.send(userObj);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        res.status(500).send({ error: 'Failed to update profile' });
    }
});

app.get('/get-profile', async (req, res) => {
    let response = {};
    const mongoUrl = process.env.DOCKER ? mongoUrlDocker : mongoUrlLocal;

    try {
        const client = await MongoClient.connect('mongodb://admin:password@localhost:27017');
        const db = client.db('user-account');

        const myquery = { userid: 1 };
        const result = await db.collection("users").findOne(myquery);

        response = result || {};
        client.close();

        // Send response
        res.send(response);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        res.status(500).send({ error: 'Failed to get profile' });
    }
});

app.listen(3000, () => {
    console.log("app listening on port 3000!");
});
