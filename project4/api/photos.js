const router = require('express').Router();
const { ObjectId } = require('mongodb');
const { Readable } = require('node:stream');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthorization } = require('../lib/auth');
const { photoUploader: uploader } = require('../lib/multer');
const { getDbReference, getPhotosBucket, getPhotosCollection } = require('../lib/mongo');
const { createChannel } = require('../lib/rabbitmq');

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
router.post('/', requireAuthorization, uploader.single('file'), async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    let photo = extractValidFields(req.body, photoSchema);
    const file = req.file;

    if (!ObjectId.isValid(photo.businessid)) {
      res.status(400).json({
        error: "Invalid businessid"
      });
      return;
    }
    const businessid = new ObjectId(photo.businessid);

    if (!ObjectId.isValid(photo.userid)) {
      res.status(400).json({
        error: "Invalid userid"
      });
      return;
    }
    const userid = new ObjectId(photo.userid);

    if (req.locals.userid !== userid.toString() && !req.locals.admin) {
      res.status(400).json({
        "error": "authenticated user does not match photo user id"
      });
      return;
    }

    const uploadStream = getPhotosBucket().openUploadStream(file.originalname, {
      metadata: {
        contentType: file.mimetype,
        userid: photo.userid,
        businessid: photo.businessid,
        caption: photo.caption,
      },
    });

    Readable.from(file.buffer).pipe(uploadStream);

    // Handle errors.
    uploadStream.on('error', err => {
      res.status(500).send({ error: err });
      return;
    });

    // When the write to GridFS is complete, call the next middleware.
    uploadStream.on('finish', async () => {
      res.status(201).json({
        id: uploadStream.id,
        links: {
          photo: `/photos/${uploadStream.id}`,
          download: `/media/photos/${uploadStream.id}`,
          business: `/businesses/${photo.businessid}`
        }
      });

      // Queue thumbnail generation to be done offline
      const channel = await createChannel('thumbnail_gen');
      channel.sendToQueue('thumbnail_gen', Buffer.from(uploadStream.id.toString()));
      channel.close();
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
  if (!ObjectId.isValid(req.params.photoID)) {
    res.status(400).json({
      error: "Invalid photo id"
    });
    return;
  }
  const photoID = new ObjectId(req.params.photoID);

  let photo = await getPhotosCollection().findOne({ _id: photoID });

  photo.links = {
    download: `/media/photos/${photo.id}`,
    business: `/businesses/${photo.businessid}`
  }

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
  if (!ObjectId.isValid(req.params.photoID)) {
    res.status(400).json({
      error: "Invalid photo id"
    });
    return;
  }
  const photoID = new ObjectId(req.params.photoID);

  const photosCollection = getDbReference().collection('photos');

  const photo = await photosCollection.findOne({ _id: photoID });

  if (photo) {
    if (validateAgainstSchema(req.body, photoSchema)) {
      /*
       * Make sure the updated photo has the same businessid and userid as
       * the existing photo.
       */
      const newPhoto = extractValidFields(req.body, photoSchema);

      if (!ObjectId.isValid(newPhoto.businessid)) {
        res.status(400).json({
          error: "Invalid businessid"
        });
        return;
      }
      newPhoto.businessid = new ObjectId(newPhoto.businessid);

      if (!ObjectId.isValid(newPhoto.userid)) {
        res.status(400).json({
          error: "Invalid userid"
        });
        return;
      }
      newPhoto.userid = new ObjectId(newPhoto.userid);

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
  if (!ObjectId.isValid(req.params.photoID)) {
    res.status(400).json({
      error: "Invalid photo id"
    });
    return;
  }
  const photoID = new ObjectId(req.params.photoID);

  const collection = getDbReference().collection('photos');

  const photo = await collection.findOne({ _id: new ObjectId(photoID) });

  if (!photo) {
    next();  // Returns 404 error
    return;
  }

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
