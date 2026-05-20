"use strict";

require('dotenv').config()
const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoUser = process.env.MONGO_ROOT_USER;
const mongoPassword = process.env.MONGO_ROOT_PASSWORD;
const mongoDBName = process.env.MONGO_ROOT_DB;

const tuserUser = process.env.MONGO_TUSER_USER;      // new user username
const tuserPassword = process.env.MONGO_TUSER_PASSWORD;  // new user password

const mongoURL =
  `mongodb://${mongoUser}:${mongoPassword}@` +
  `${mongoHost}:${mongoPort}/${mongoDBName}`;

function status(s) {
    console.log(`init: ${s}`);
}

async function main() {
    let good = true;
    
    for (let v of ["MONGO_ROOT_PASSWORD", "MONGO_TUSER_PASSWORD"]) {
        if (!process.env[v]) {
            status(`must set environment variable ${v}`);
            good = false;
        }
    }

    if (!good) process.exit(1);

    status("connecting...");

    const client = await MongoClient.connect(mongoURL);

    const db = client.db('thingdb');

    status("database created");

    await db.command({
        createUser: tuserUser,
        pwd: tuserPassword,
        roles: [ { role: "readWrite", db: "thingdb" } ]
    });

    status("user created");

    await client.close();

    status("connection closed");
}

main();
