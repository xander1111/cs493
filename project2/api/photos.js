const router = require('express').Router();
const { ObjectId } = require('mongodb');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};


/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    const photo = extractValidFields(req.body, photoSchema);

    const photosCollection = req.app.locals.db.collection('photos');

    const result = await photosCollection.insertOne(photo);

    res.status(201).json({
      id: photo.id,
      links: {
        photo: `/photos/${result.insertedId}`,
        business: `/businesses/${photo.businessid}`
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  let photoID = null;
  try {
    photoID = new ObjectId(req.params.photoID);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const photosCollection = req.app.locals.db.collection('photos');

  const photo = await photosCollection.findOne({ _id:photoID });

  if (photo) {
    res.status(200).json(photo);
  } else {
    next();
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
  let photoID = null;
  try {
    photoID = new ObjectId(req.params.photoID);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const photosCollection = req.app.locals.db.collection('photos');

  const photo = await photosCollection.findOne({ _id: photoID });
  
  if (photo) {
    if (validateAgainstSchema(req.body, photoSchema)) {
      /*
       * Make sure the updated photo has the same businessid and userid as
       * the existing photo.
       */
      const newPhoto = extractValidFields(req.body, photoSchema);
      const existingPhoto = photos[photoID];
      if (newPhoto && newPhoto.businessid === existingPhoto.businessid && newPhoto.userid === existingPhoto.userid) {

        const result = await photosCollection.replaceOne({ _id: photoID }, newPhoto);

        res.status(200).json({
          links: {
            photo: `/photos/${photoID}`,
            business: `/businesses/${updatedPhoto.businessid}`
          }
        });
      } else {
        res.status(403).json({
          error: "Updated photo cannot modify businessid or userid"
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid photo object"
      });
    }

  } else {
    next();
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', function (req, res, next) {
  let photoID = null;
  try {
    photoID = new ObjectId(req.params.photoID);
  } catch (error) {
    // Invalid ID format
    next();
  }

  const photosCollection = req.app.locals.db.collection('photos');

  const result = await photosCollection.deleteOne({ _id: photoID });

  if (result.deletedCount > 0) {
    res.status(204).end();
  } else {
    next();
  }
});
