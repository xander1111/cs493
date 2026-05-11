const express = require('express');
const morgan = require('morgan');

const api = require('./api');

const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 8000;

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_INITDB_DATABASE || 'project2db';
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_USER_PASSWORD;

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;

let db;

MongoClient.connect(mongoUrl).then((client) => {
  db = client.db(mongoDBName);
  app.locals.db = db;

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});


/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      err: "Server error.  Please try again later."
  })
})

