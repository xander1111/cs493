const express = require('express');

const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 8086;



const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_DB_NAME || 'messagesdb';
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;

let db;

MongoClient.connect(mongoUrl).then((client) => {
    db = client.db(mongoDBName);
    
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
});

app.use(express.json());


app.get('/messages', async (req, res, next) => {
    const collection = db.collection("messages");

    const results = await collection.find({}).toArray();

    const messages = []

    results.forEach(message => {
        messages.push({
            id: message._id,
            message: message.message
        });
    });

    res.status(200).json({ messages: messages });
});

app.get('/messages/:id', async (req, res, next) => {
    id = req.params.id;
    
    const collection = db.collection("messages");

    const results = await collection.find({ _id: new ObjectId(req.params.id) }).toArray();

    if (!results[0]) {
        res.status(404).json({
            "error": `Message ${id} not found`
        });
        return;
    }

    res.status(200).json({ message: results[0].message });
});

app.post('/messages', async (req, res, next) => {
    if (req.body.message == null) {
        res.status(400).json({
            "error": `'message' field not specified in request data`
        });
        return;
    }

    const collection = db.collection("messages");

    const results = await collection.insertOne({ message: req.body.message });

    res.status(201).json({
        "id": String(results.insertedId),
        "links": {
            "self": `/messages/${String(results.insertedId)}`
        }
    });
});

app.delete('/messages/:id', async (req, res, next) => {
    id = req.params.id;

    const collection = db.collection("messages");

    const results = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (results.deletedCount === 0) {
        res.status(404).json({ "error": `Message ${id} not found` });
        return;
    }

    res.status(200).json({ "message": "Deleted successfully" });
});
