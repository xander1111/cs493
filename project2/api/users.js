const router = require('express').Router();

exports.router = router;

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  let userid = null;
  try {
    userid = new ObjectId(req.params.userid);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const businessesCollection = req.app.locals.db.collection('businesses');

  const userBusinesses = await businessesCollection.find({ ownerid: userid }).toArray();

  // TODO add photos and reviews to businesses

  res.status(200).json({
    businesses: userBusinesses
  });
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', function (req, res) {
  let userid = null;
  try {
    userid = new ObjectId(req.params.userid);
  } catch (error) {
    // Invalid ID format
    next();
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
router.get('/:userid/photos', function (req, res) {
  let userid = null;
  try {
    userid = new ObjectId(req.params.userid);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const photosColleciton = req.app.locals.db.collection('photos');

  const userPhotos = await photosColleciton.find({ userid: userid }).toArray();
  res.status(200).json({
    photos: userPhotos
  });
});
