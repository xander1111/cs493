const router = require('express').Router();
const { ObjectId } = require('mongodb');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthorization } = require('../lib/auth');

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
router.post('/', requireAuthorization, async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    let photo = extractValidFields(req.body, photoSchema);
    try {
      photo.businessid = new ObjectId(photo.businessid);
    } catch {
      res.status(400).json({
        error: "Invalid businessid"
      });
      return;
    }

    try {
      photo.userid = new ObjectId(photo.userid);
    } catch {
      res.status(400).json({
        error: "Invalid userid"
      });
      return;
    }

    if (req.locals.userid !== photo.userid.toString() && !req.locals.admin) {
      res.status(400).json({
        "error": "authenticated user does not match photo user id"
      });
      return;
    }

    const photosCollection = req.app.locals.db.collection('photos');

    const result = await photosCollection.insertOne(photo);

    res.status(201).json({
      id: result.insertedId,
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
    res.status(400).json({
      error: "Invalid photoid"
    });
    return;
  }

  const photosCollection = req.app.locals.db.collection('photos');

  const photo = await photosCollection.findOne({ _id: photoID });

  if (photo) {
    res.status(200).json(photo);
  } else {
    next();
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', requireAuthorization, async function (req, res, next) {
  let photoID = null;
  try {
    photoID = new ObjectId(req.params.photoID);
  } catch (error) {
    // Invalid ID format
    next();
    return;
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
      try {
        newPhoto.businessid = new ObjectId(newPhoto.businessid);
      } catch {
        res.status(400).json({
          error: "Invalid businessid"
        });
        return;
      }
      try {
        newPhoto.userid = new ObjectId(newPhoto.userid);
      } catch {
        res.status(400).json({
          error: "Invalid userid"
        });
        return;
      }

      if (req.locals.userid !== photo.userid.toString() && !req.locals.admin) {
        res.status(401).json({
          "error": "user not authorized to modify photo, authenticated userid does not match photo user id"
        });
        return;
      }

      const existingPhoto = await photosCollection.findOne({ _id: photoID });

      if (newPhoto && (!newPhoto.businessid.equals(existingPhoto.businessid) || !newPhoto.userid.equals(existingPhoto.userid)) && !req.locals.admin) {
        res.status(400).json({
          error: "Updated photo cannot modify businessid or userid"
        });
        return;
      }

      const result = await photosCollection.replaceOne({ _id: photoID }, newPhoto);

      res.status(200).json({
        links: {
          photo: `/photos/${photoID}`,
          business: `/businesses/${newPhoto.businessid}`
        }
      });
  
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
router.delete('/:photoID', requireAuthorization, async function (req, res, next) {
  let photoID = null;
  try {
    photoID = new ObjectId(req.params.photoID);
  } catch (error) {
    // Invalid ID format
    next();
    return;
  }

  const collection = req.app.locals.db.collection('photos');

  const photo = await collection.findOne({ _id: new ObjectId(photoID) });

  if (req.locals.userid !== photo.userid.toString()) {
    res.status(401).json({
      "error": "user not authorized to delete photo, authenticated user does not match photo user id"
    });
    return;
  }

  const result = await collection.deleteOne({ _id: photoID });

  if (result.deletedCount > 0) {
    res.status(204).end();
  } else {
    next();
  }
});
