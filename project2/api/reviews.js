const router = require('express').Router();
const { ObjectId } = require('mongodb');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};


/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {

    const review = extractValidFields(req.body, reviewSchema);

    const reviewsCollection = req.app.locals.db.collection('reviews');

    /*
     * Make sure the user is not trying to review the same business twice.
     */
    const userReviewedThisBusinessAlready = await reviewsCollection.findOne({ userid: review.userid, businessid: review.businessid });

    if (userReviewedThisBusinessAlready) {
      res.status(403).json({
        error: "User has already posted a review of this business"
      });
    } else {
      const result = await reviewsCollection.insertOne(review);

      res.status(201).json({
        id: review.id,
        links: {
          review: `/reviews/${result.insertedId}`,
          business: `/businesses/${review.businessid}`
        }
      });
    }

  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', function (req, res, next) {
  let reviewID = null;
  try {
    reviewID = new ObjectId(req.params.reviewID);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const reviewsCollection = req.app.locals.db.collection('reviews');

  const review = await reviewsCollection.findOne({ _id: reviewID });

  if (reviews) {
    res.status(200).json(review);
  } else {
    next();
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  let reviewID = null;
  try {
    reviewID = new ObjectId(req.params.reviewID);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const reviewsCollection = req.app.locals.db.collection('reviews');

  const review = await reviewsCollection.findOne({ _id: reviewID });


  if (review) {

    if (validateAgainstSchema(req.body, reviewSchema)) {
      /*
       * Make sure the updated review has the same businessid and userid as
       * the existing review.
       */
      let newReview = extractValidFields(req.body, reviewSchema);
      let existingReview = reviews[reviewID];
      if (newReview.businessid === existingReview.businessid && newReview.userid === existingReview.userid) {
        const result = await reviewsCollection.replaceOne({ _id: reviewID }, newReview);

        res.status(200).json({
          links: {
            review: `/reviews/${reviewID}`,
            business: `/businesses/${newReview.businessid}`
          }
        });
      } else {
        res.status(403).json({
          error: "Updated review cannot modify businessid or userid"
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid review object"
      });
    }

  } else {
    next();
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', function (req, res, next) {
  let reviewID = null;
  try {
    reviewID = new ObjectId(req.params.reviewID);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const reviewsCollection = req.app.locals.db.collection('reviews');

  const result = await reviewsCollection.deleteOne({ _id: reviewID });
  
  if (result.deletedCount > 0) {
    res.status(204).end();
  } else {
    next();
  }
});
