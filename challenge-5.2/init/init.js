require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_ROOT_USER;
const mongoPassword = process.env.MONGO_ROOT_PASSWORD;
const mongoDBName = process.env.MONGO_ROOT_DB;

const muserPassword = process.env.MONGO_MUSER_PASSWORD;  // new user password

const mongoURL =
  `mongodb://${mongoUser}:${mongoPassword}@` +
  `${mongoHost}:${mongoPort}/${mongoDBName}`;

function status(s) {
    console.log(`init: ${s}`);
}

async function main() {
    if (!mongoPassword) {
        status("must set MONGO_ROOT_PASSWORD to the root password");
        process.exit(1);
    }

    if (!muserPassword) {
        status("must set MONGO_MUSER_PASSWORD to the new user password");
        process.exit(1);
    }

    status("connecting...");

    const client = await MongoClient.connect(mongoURL);

    const db = client.db('messagesdb');

    status("database created");

    await db.command({
        createUser: "muser",
        pwd: muserPassword,
        roles: [ { role: "readWrite", db: "messagesdb" } ]
    });

    status("user created");

    await client.close();

    status("connection closed");
}

main();
