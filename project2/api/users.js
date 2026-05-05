const router = require('express').Router();
const { ObjectId } = require('mongodb');

exports.router = router;

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
    },
    {
      $match: { ownerid: userid }
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
