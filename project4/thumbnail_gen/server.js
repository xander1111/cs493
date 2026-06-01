const sharp = require('sharp');
const { pipeline } = require('stream/promises');

const amqp = require('amqplib');

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;


const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_USER_PASSWORD;
const mongoDbName = process.env.MONGO_INITDB_DATABASE;

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDbName}`;

let db = null;
let _closeDbConnection = null;

let photosBucket = null;
let photoFilesCollection = null;
let thumbsBucket = null;


async function processImage(id) {
    const file = photoFilesCollection.findOne({ _id: id });

    if (!file) {
        return;
    }

    const downloadStream = photosBucket.openDownloadStream(id);

    const uploadStream = thumbsBucket.openUploadStream(`thumb-${id}.jpg`, {
        contentType: 'image/jpeg',
        metadata: { originalid: id }
    })

    downloadStream.on('error', err => {
        res.status(500).send({ error: err });
        return;
    });

    const resizeStream = sharp()
        .resize(100, 100, { fit: 'cover' })
        .jpeg();

    await pipeline(downloadStream, resizeStream, uploadStream);

    photoFilesCollection.updateOne({ _id: id }, {
        $set: { thumbid: uploadStream.id }
    });}


async function main() {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('thumbnail_gen');

        channel.consume('thumbnail_gen', (msg) => {
            if (msg) {
                processImage(new ObjectId(msg.content.toString));
            }

            channel.ack(msg);
        });
    } catch (err) {
        console.error(err);
    }
}


MongoClient.connect(mongoUrl).then(async function (client) {
    db = client.db(mongoDbName);
    _closeDbConnection = function () {
        client.close();
    };

    photosBucket = new GridFSBucket(db, { bucketName: 'photos' });
    photoFilesCollection = await db.collection('photos.files');

    thumbsBucket = new GridFSBucket(db, { bucketName: 'thumbs' });

    main();
});
