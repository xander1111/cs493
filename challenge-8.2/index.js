"use strict";

require('dotenv').config();
const express = require('express');
const app = express();
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');

app.use(express.json());

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoUser = process.env.MONGO_TUSER_USER;
const mongoPassword = process.env.MONGO_TUSER_PASSWORD;
const mongoDBName = process.env.MONGO_TUSER_DB;

const mongoURL =
  `mongodb://${mongoUser}:${mongoPassword}@` +
  `${mongoHost}:${mongoPort}/${mongoDBName}`;

const port = 8086;

let db;

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.get('/thing/:filename', async (req, res) => {
    // TODO
});

app.post('/thing', upload.single('thingdata'), /* storeFile, */ (req, res) => {
    console.log(`== Received ${req.file.mimetype} file: ${req.file.originalname}`);
    res.status(200).send("upload successful");
});

app.get('/upload', (req, res) => {
    res.type('html').send(`<h1>Upload some data</h1>
        <form method="POST" action="/thing" enctype="multipart/form-data">
            <input type="file" name="thingdata">
            <button type="submit">Upload</button>
        </form>`);
});

MongoClient.connect(mongoURL).then(function (client) {
    db = client.db(mongoDBName);

    app.listen(port, function () {
        console.log("== Server listening on port", port);
    });
});

