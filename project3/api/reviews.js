const router = require('express').Router();
const { ObjectId } = require('mongodb');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthorization } = require('../lib/auth');

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
router.post('/', requireAuthorization, async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {

    const review = extractValidFields(req.body, reviewSchema);

    if (!ObjectId.isValid(review.businessid)) {
      res.status(400).json({
        error: "Invalid businessid"
      });
      return;
    }
    review.businessid = new ObjectId(review.businessid);

    if (!ObjectId.isValid(review.userid)) {
      res.status(400).json({
        error: "Invalid userid"
      });
      return;
    }
    review.userid = new ObjectId(review.userid);

    if (req.locals.userid !== review.userid.toString() && !req.locals.admin) {
      res.status(400).json({
        "error": "authenticated user does not match review user id"
      });
      return;
    }

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
        id: result.insertedId,
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
router.get('/:reviewID', async function (req, res, next) {
  if (!ObjectId.isValid(req.params.reviewID)) {
    res.status(400).json({
      error: "Invalid review id"
    });
    return;
  }
  const reviewID = new ObjectId(req.params.reviewID);

  const reviewsCollection = req.app.locals.db.collection('reviews');

  const review = await reviewsCollection.findOne({ _id: reviewID });

  if (review) {
    res.status(200).json(review);
  } else {
    next();
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', requireAuthorization, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.reviewID)) {
    res.status(400).json({
      error: "Invalid review id"
    });
    return;
  }
  const reviewID = new ObjectId(req.params.reviewID);

  const reviewsCollection = req.app.locals.db.collection('reviews');
  const review = await reviewsCollection.findOne({ _id: reviewID });

  if (review) {

    if (validateAgainstSchema(req.body, reviewSchema)) {
      /*
       * Make sure the updated review has the same businessid and userid as
       * the existing review.
       */
      let newReview = extractValidFields(req.body, reviewSchema);

      if (!ObjectId.isValid(newReview.businessid)) {
        res.status(400).json({
          error: "Invalid businessid"
        });
        return;
      }
      newReview.businessid = new ObjectId(newReview.businessid);

      if (!ObjectId.isValid(newReview.userid)) {
        res.status(400).json({
          error: "Invalid userid"
        });
        return;
      }
      newReview.userid = new ObjectId(newReview.userid);

      if (req.locals.userid !== review.userid.toString() && !req.locals.admin) {
        res.status(401).json({
          "error": "user not authorized to modify review, authenticated user does not match review user id"
        });
        return;
      }

      let existingReview = await reviewsCollection.findOne({ _id: reviewID });
      if (newReview && newReview.businessid.equals(existingReview.businessid) && newReview.userid.equals(existingReview.userid)) {
        const result = await reviewsCollection.replaceOne({ _id: reviewID }, newReview);

        res.status(200).json({
          links: {
            review: `/reviews/${reviewID}`,
            business: `/businesses/${newReview.businessid}`
          }
        });
      } else {
        res.status(400).json({
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
router.delete('/:reviewID', requireAuthorization, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.reviewID)) {
    res.status(400).json({
      error: "Invalid review id"
    });
    return;
  }

  const reviewID = new ObjectId(req.params.reviewID);

  const collection = req.app.locals.db.collection('reviews');

  const review = await collection.findOne({ _id: new ObjectId(reviewID) });

  if (!review) {
    next();  // Returns 404 error
    return;
  }
  
  if (req.locals.userid !== review.userid.toString()) {
    res.status(401).json({
      "error": "user not authorized to delete review, authenticated user does not match review user id"
    });
    return;
  }

  const result = await collection.deleteOne({ _id: reviewID });

  if (result.deletedCount > 0) {
    res.status(204).end();
  } else {
    next();
  }
});
