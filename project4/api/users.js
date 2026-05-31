const router = require('express').Router();
const { ObjectId } = require('mongodb');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthorization, tryAuthorization } = require('../lib/auth');
const { getDbReference } = require('../lib/mongo');

exports.router = router;

const userSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  admin: { required: false }
};

const loginSchema = {
  email: { required: true },
  password: { required: true },
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', requireAuthorization, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.userid)) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const userid = new ObjectId(req.params.userid);

  if (req.locals.userid !== userid.toString() && !req.locals.admin) {
    res.status(401).json({
      "error": "user not authorized to access this resource"
    });
    return;
  }

  const businessesCollection = getDbReference().collection('businesses');

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
router.get('/:userid/reviews', requireAuthorization, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.userid)) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const userid = new ObjectId(req.params.userid);

  if (req.locals.userid !== userid.toString() && !req.locals.admin) {
    res.status(401).json({
      "error": "user not authorized to access this resource"
    });
    return;
  }

  const reviewsCollection = getDbReference().collection('reviews');

  const userReviews = await reviewsCollection.find({ userid: userid }).toArray();
  res.status(200).json({
    reviews: userReviews
  });
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', requireAuthorization, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.userid)) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const userid = new ObjectId(req.params.userid);

  if (req.locals.userid !== userid.toString() && !req.locals.admin) {
    res.status(401).json({
      "error": "user not authorized to access this resource"
    });
    return;
  }

  const photosColleciton = getDbReference().collection('photos');

  const userPhotos = await photosColleciton.find({ userid: userid }).toArray();
  res.status(200).json({
    photos: userPhotos
  });
});

/*
 * Route to create a new user account
 */
router.post('/', tryAuthorization, async function (req, res, next) {
  if (validateAgainstSchema(req.body, userSchema)) {
    const collection = getDbReference().collection("users");

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
      admin: req.locals.admin && newUser.admin  // If this request is not being made by an admin, set admin to false
    });

    res.status(200).json({
      "status": "ok",
      "id": result.insertedId
    });
  } else {
    res.status(400).json({
      "error": "Request body is not a valid user object"
    });
  }
});

router.post('/:userid', async function (req, res, next) {
  if (!ObjectId.isValid(req.params.userid)) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const userid = new ObjectId(req.params.userid);

  if (validateAgainstSchema(req.body, loginSchema)) {
    const collection = getDbReference().collection("users");
    const loginDetails = extractValidFields(req.body, loginSchema);

    const user = await collection.findOne({ _id: userid });
    if (!user) {
      res.status(401).json({
        "status": "invalid login"
      });
      return;
    }

    const password_hash = user.password;

    const valid_login = await bcrypt.compare(loginDetails.password, password_hash);

    if (valid_login) {
      const payload = { "userid": userid, "admin": user.admin ?? false };
      const expiration = { "expiresIn": "24h" };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, expiration);

      res.status(200).json({
        "status": "ok",
        "token": token
      });
    } else {
      res.status(401).json({
        "status": "invalid login"
      });
    }

  } else {
    res.status(400).json({
      "error": "Request body is not a valid login object"
    });
  }
});

router.get('/:userid', requireAuthorization, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.userid)) {
    res.status(400).json({
      error: "Invalid userid"
    });
    return;
  }

  const userid = new ObjectId(req.params.userid);

  if (req.locals.userid !== userid.toString() && !req.locals.admin) {
    res.status(401).json({
      "error": "user not authorized to access this resource"
    });
    return;
  }

  const collection = getDbReference().collection("users");

  const user = await collection.findOne({ _id: userid });
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin ?? false
    });
  } else {
    next();
  }
});
