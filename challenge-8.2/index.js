"use strict";

require('dotenv').config();
const express = require('express');
const app = express();
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');

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

const upload = multer({ storage: multer.memoryStorage() });

let gfs_bucket = undefined;

function storeFile(req, res, next) {
    // Convenience variable that refers to the file that was uploaded.
    const file = req.file;

    // Open a writable stream into GridFS that will store the file with
    // filename `originalname`. Also, attach the file MIME type as
    // metadata for later use by the GETter.
    const uploadStream = gfs_bucket.openUploadStream(file.originalname, {
        metadata: { contentType: file.mimetype },
    });

    // Multer stored the file in memory in file.buffer. Pipe it into
    // GridFS tos store it.
    Readable.from(file.buffer).pipe(uploadStream);

    // Handle errors.
    uploadStream.on('error', err => res.status(500).send({ error: err }));

    // When the write to GridFS is complete, call the next middleware.
    uploadStream.on('finish', () => { next(); });
}

async function readFile(req, res, next) {
    const file = await db.collection('uploads.files').findOne({ filename: req.params.filename });

    if (!file) {
        return res.status(404).send('Not found');
    }

    req.file = file;

    const downloadStream = gfs_bucket.openDownloadStreamByName(req.params.filename);

    downloadStream.on('error', err => {
        res.status(400).send({ error: err });
        return;
    });

    req.downloadStream = downloadStream;
    next();
}

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.get('/thing/:filename', readFile, async (req, res) => {
    res.status(200).type(req.file.metadata.contentType);
    req.downloadStream.pipe(res);
});

app.post('/thing', upload.single('thingdata'), storeFile, (req, res) => {
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

    gfs_bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    app.listen(port, function () {
        console.log("== Server listening on port", port);
    });
});

