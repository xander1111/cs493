/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient, GridFSBucket } = require('mongodb')

const mongoHost = process.env.MONGO_HOST || 'localhost'
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_USER_PASSWORD
const mongoDbName = process.env.MONGO_INITDB_DATABASE

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDbName}`

let db = null
let _closeDbConnection = null

let photosBucket = null
let photoFilesCollection = null

let thumbsBucket = null
let thumbFilesCollection = null

exports.connectToDb = function (callback) {
  MongoClient.connect(mongoUrl).then(async function (client) {
    db = client.db(mongoDbName)
    _closeDbConnection = function () {
      client.close()
    }

    photosBucket = new GridFSBucket(db, { bucketName: 'photos' });
    photoFilesCollection = await db.collection('photos.files');

    thumbsBucket = new GridFSBucket(db, { bucketName: 'thumbs' });
    thumbFilesCollection = await db.collection('thumbs.files');

    callback()
  })
}

exports.getDbReference = function () {
  return db
}

exports.closeDbConnection = function (callback) {
  _closeDbConnection(callback)
}

exports.getPhotosBucket = function () {
  return photosBucket
}

exports.getPhotoFilesCollection = function () {
  return photoFilesCollection
}

exports.getThumbsBucket = function () {
  return thumbsBucket
}

exports.getThumbFilesCollection = function () {
  return thumbFilesCollection
}

