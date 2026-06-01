const router = require('express').Router();
const { ObjectId } = require('mongodb');
const { Readable } = require('node:stream');

const { getPhotoFilesCollection, getPhotosBucket } = require('../lib/mongo');

exports.router = router;


router.get('/photos/:photoid', async (req, res, next) => {
    if (!ObjectId.isValid(req.params.photoid)) {
        res.status(400).json({
            error: "Invalid photoid"
        });
        return;
    }
    const photoid = new ObjectId(req.params.photoid);

    const file = await getPhotoFilesCollection().findOne({ _id: photoid });

    if (file) {
        const downloadStream = getPhotosBucket().openDownloadStream(photoid);

        downloadStream.on('error', err => {
            res.status(500).send({ error: err });
            return;
        });

        res.status(200).type(file.metadata.contentType);
        downloadStream.pipe(res);
    } else {
        next();
    }
});
