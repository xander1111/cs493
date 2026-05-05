"use strict";

require('dotenv').config()
const express = require('express')
const app = express();
const { MongoClient, ObjectId } = require('mongodb');

const bcrypt = require('bcryptjs')

app.use(express.json());

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoUser = process.env.MONGO_MUSER_USER;
const mongoPassword = process.env.MONGO_MUSER_PASSWORD;
const mongoDBName = process.env.MONGO_MUSER_DB;

const mongoURL =
  `mongodb://${mongoUser}:${mongoPassword}@` +
  `${mongoHost}:${mongoPort}/${mongoDBName}`;

const port = 8086;

let db;

function normalize_message(m) {
    const id = String(m._id);

    return {
        "id": id,
        "message": m.message,
        "links": {
            "self": `/messages/${id}`
        }
    };
}

app.get("/messages", async (req, res, next) => {
    const collection = db.collection("messages");

    const result = await collection.find({}).toArray();

    const messages = [];

    for (let m of result)
        messages.push(normalize_message(m));

    res.send(messages);

    console.log("== Retrieved all messages");
});

app.get("/messages/:id", async (req, res, next) => {
    const collection = db.collection("messages");

    const id = req.params.id;  // string
    const obj_id = new ObjectId(id);

    const messages = await collection.find({_id: obj_id}).toArray();

    if (messages.length > 0) {
        res.send(normalize_message(messages[0]));
        console.log(`== Retrieved from id ${id}`);
    } else {
        res.status(404).send({"error": `Message ${id} not found`});
        console.log(`== ID ${id} not found`);
    }
});

app.post("/messages", async (req, res, next) => {
    const collection = db.collection("messages");

    const message = req.body.message;

    const result = await collection.insertOne({"message": message});

    const obj_id = result.insertedId;   // ObjectId
    const id = String(obj_id);          // String

    res.status(201).send({
        "id": id,
        "links": {
            "self": `/messages/${id}`
        }
    });

    console.log(`== Posted to id ${id}`);
});

app.delete('/messages/:id', async (req, res, next) => {
    const collection = db.collection("messages");

    const id = req.params.id;
    const obj_id = new ObjectId(id);

    const result = await collection.deleteOne({_id: obj_id});

    if (result.deletedCount > 0) {
        res.status(200).send({"status": `message ${id} deleted`});
    } else {
        res.status(404).send({"error": `Message ${id} not found`});
        console.log(`== ID ${id} not found`);
    }
});

app.post('/users', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({
            "error": "'username' and 'password' fields required"
        });
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    const collection = db.collection("users");

    const userExists = await collection.findOne({ username: username });
    if (userExists) {
        res.status(409).json({
            "error": "username already in use"  // Does give away some info; provides a way to enumerate existing users. I don't really see a good way to avoid this without using something like an email though.
        });
        return;
    }

    const password_hash = await bcrypt.hash(password, 8);

    const result = await collection.insertOne({ username: username, password: password_hash });

    res.status(200).json({
        "status": "ok"
    });
});

app.post('/login', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({
            "error": "'username' and 'password' fields required"
        });
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    const collection = db.collection("users");
    const user = await collection.findOne({ username: username });
    if (!user) {
        res.status(403).json({
            "status": "invalid login"
        });
        return;
    }

    const password_hash = user.password;

    const valid_login = await bcrypt.compare(password, password_hash);

    if (valid_login) {
        res.status(200).json({
            "status": "ok"
        });
    } else {
        res.status(403).json({
            "status": "invalid login"
        });
    }
});

MongoClient.connect(mongoURL).then(function (client) {
    db = client.db(mongoDBName);

    app.listen(port, function () {
        console.log("== Server listening on port", port);
    });
});

