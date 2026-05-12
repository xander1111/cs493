const router = require('express').Router();
const { ObjectId } = require('mongodb');

const bcrypt = require('bcryptjs');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

const userSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  admin: { required: false }
};

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res, next) {
  let userid = null;
  try {
    userid = new ObjectId(req.params.userid);
  } catch (error) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const businessesCollection = req.app.locals.db.collection('businesses');

  const pipeline = [
    {
      $match: { ownerid: userid }
    },
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "businessid",
        as: "photos"
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "businessid",
        as: "reviews"
      }
    }
  ];
  const userBusinesses = await businessesCollection.aggregate(pipeline).toArray();

  res.status(200).json({
    businesses: userBusinesses
  });
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res, next) {
  let userid = null;
  try {
    userid = new ObjectId(req.params.userid);
  } catch (error) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const reviewsCollection = req.app.locals.db.collection('reviews');

  const userReviews = await reviewsCollection.find({ userid: userid }).toArray();
  res.status(200).json({
    reviews: userReviews
  });
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res, next) {
  let userid = null;
  try {
    userid = new ObjectId(req.params.userid);
  } catch (error) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const photosColleciton = req.app.locals.db.collection('photos');

  const userPhotos = await photosColleciton.find({ userid: userid }).toArray();
  res.status(200).json({
    photos: userPhotos
  });
});

/*
 * Route to create a new user account
 */
router.post('/users', async function (req, res, next) {
  if (validateAgainstSchema(req.body, userSchema)) {
    const collection = db.collection("users");

    const newUser = extractValidFields(req.body, userSchema);

    const userExists = await collection.findOne({ name: newUser.name });
    if (userExists) {
      res.status(409).json({
        "error": "username already in use"  // Does give away some info; provides a way to enumerate existing users. I don't really see a good way to avoid this
      });
      return;
    }

    const emailInUse = await collection.findOne({ email: newUser.email });
    if (emailInUse) {
      res.status(409).json({
        "error": "email already in use"  // Does give away some info; provides a way to enumerate emails in use. Could be solved by instead always returning the same message (something like 'check your email for a verification code/link') and only sending an email if it's not already in use
      });
      return;
    }

    const hashedPass = await bcrypt.hash(newUser.password, 8);

    const result = await collection.insertOne({
      name: newUser.name,
      email: newUser.email,
      password: hashedPass,
      admin: false
    });

    res.status(200).json({
      "status": "ok"
    });
  } else {
    res.status(400).json({
      "error": "Request body is not a valid user object"
    });
  }
});
