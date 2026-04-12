const express = require('express');

const app = express();
const port = process.env.PORT;

app.use(express.json());


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


// Generate placeholder example data

// Example business data
const exampleBusinesses = {};
const exampleBusinessIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24, 25]
exampleBusinessIds.forEach(id => {
    exampleBusinesses[id] = {
        "id": id,
        "name": `Example business ${id}`,
        "address": "123 Main St",
        "city": "Bend",
        "state": "Oregon",
        "zip": "97702",
        "phone": "5555555555",
        "category": "store",
        "subcategory": "clothing",
        "website": "example.com",
        "email": `business${id}@example.com`,
        "links": {
            "reviews": `/businesses/${id}/reviews`,
            "photos": `/businesses/${id}/photos`
        }
    };
})

// Example review data
const exampleReviews = {};
const exampleReviewIds = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15]
exampleReviewIds.forEach(id => {
    exampleReviews[id] = {
        "id": id,
        "business": id % 5 + 1,
        "user": id % 3 + 1,
        "rating": 3,
        "priceRating": 3,
        "comment": `Example review #${id}`,
        "links": {
            "business": `/businesses/${id % 5 + 1}`
        }
    };
})

// Example photo data
const examplePhotos = {};
const examplePhotoIds = [1, 2, 3, 14, 15]
examplePhotoIds.forEach(id => {
    examplePhotos[id] = {
        "id": id,
        "business": id % 5 + 1,
        "user": id % 3 + 1,
        "imageUrl": `/photoData/${id}`,
        "caption": `Example photo #${id}`,
        "links": {
            "business": `/businesses/${id}`
        }
    };
})



// Businesses endpoints
app.get('/businesses', (req, res, next) => {
    const pageNumber = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    const totalPages = Math.ceil(exampleBusinessIds.length / 10);
    const businessIds = exampleBusinessIds.slice((pageNumber - 1) * 10, pageNumber * 10);
    const businesses = [];

    businessIds.forEach(id => {
        businesses.push(exampleBusinesses[id])
    })

    res.status(200).json({
        "pageNumber": pageNumber,
        "totalPages": totalPages,
        "pageSize": 10,
        "totalCount": exampleBusinessIds.length,
        "businesses": businesses,
        "links": {
            "nextPage": pageNumber < totalPages ? `/businesses?page=${pageNumber + 1}` : undefined,
            "lastPage": `/businesses?page=${totalPages}`
        }
    });
});

app.get('/businesses/:id', (req, res, next) => {
    if (req.params.id in exampleBusinesses) {
        res.status(200).json(exampleBusinesses[req.params.id]);
    } else {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
    }
});

app.post('/businesses', (req, res, next) => {
    const newBusiness = req.body
    const requiredFields = ["name", "address", "city", "state", "zip", "phone", "category", "subcategory"]

    requiredFields.forEach(field => {
        if (!field in newBusiness) {
            res.status(400).json({ "message": "Invalid business object" })
        }
    });

    // Placeholder, doesn't actually store data
    res.status(201).json({
        "message": "successfully created",
        "business": {
            "id": 26,
            "name": newBusiness.name,
            "address": newBusiness.address,
            "city": newBusiness.city,
            "state": newBusiness.state,
            "zip": newBusiness.zip,
            "phone": newBusiness.phone,
            "category": newBusiness.category,
            "subcategory": newBusiness.subcategory,
            "website": newBusiness.website === undefined ? null : newBusiness.website,
            "email": newBusiness.email === undefined ? null : newBusiness.website,
            "links": {
                "reviews": "/businesses/26/reviews",
                "photos": "/businesses/26/photos"
            }
        },
        "link": `/businesses/26`
    });
});

app.patch('/businesses/:id', (req, res, next) => {
    if (!req.params.id in exampleBusinesses) {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
        return;
    }

    const updatedFields = req.body;
    const oldBusiness = exampleBusinesses[req.params.id];

    // Placeholder, doesn't actually update data
    let updatedBusiness = {
        "id": req.params.id,
        "name": updatedFields.name ?? oldBusiness.name,
        "address": updatedFields.address ?? oldBusiness.address,
        "city": updatedFields.city ?? oldBusiness.city,
        "state": updatedFields.state ?? oldBusiness.state,
        "zip": updatedFields.zip ?? oldBusiness.zip,
        "phone": updatedFields.phone ?? oldBusiness.phone,
        "category": updatedFields.category ?? oldBusiness.category,
        "subcategory": updatedFields.subcategory ?? oldBusiness.subcategory,
        "website": updatedFields.website ?? oldBusiness.website,
        "email": updatedFields.email ?? oldBusiness.email,
        "links": {
            "reviews": `/businesses/${req.params.id}/reviews`,
            "photos": `/businesses/${req.params.id}/photos`
        }
    };

    // Placeholder, doesn't actually update data
    res.status(200).json({
        "message": "successfully updated",
        "business": updatedBusiness,
        "link": `/businesses/${req.params.id}`
    });
});

app.delete('/businesses/:id', (req, res, next) => {
    if (req.params.id in exampleBusinesses) {
        // Placeholder, doesn't actually delete data
        res.status(200).json({
            "message": "deleted successfully",
            "deleted": exampleBusinesses[req.params.id]
        });
    } else {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
    }
});



// Reviews endpoints
app.get('/businesses/:id/reviews', (req, res, next) => {
    if (!req.params.id in exampleBusinesses) {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
        return;
    }

    const pageNumber = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    const totalPages = Math.ceil(exampleReviewIds.length / 10);
    const reviewIds = exampleReviewIds.slice((pageNumber - 1) * 10, pageNumber * 10);
    const reviews = [];

    reviewIds.forEach(id => {
        reviews.push(examplePhotos[id])
    })

    res.status(200).json({
        "pageNumber": pageNumber,
        "totalPages": totalPages,
        "pageSize": 10,
        "totalCount": exampleReviewIds.length,
        "reviews": reviews,
        "links": {
            "nextPage": pageNumber < totalPages ? `/businesses/${req.params.id}/reviews?page=${pageNumber + 1}` : undefined,
            "lastPage": `/businesses/${req.params.id}/reviews?page=${totalPages}`
        }
    });
});

app.get('/reviews', (req, res, next) => {
    const pageNumber = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    const totalPages = Math.ceil(exampleReviewIds.length / 10);
    const reviewIds = exampleReviewIds.slice((pageNumber - 1) * 10, pageNumber * 10);
    const reviews = [];

    reviewIds.forEach(id => {
        reviews.push(exampleReviews[id])
    })

    res.status(200).json({
        "pageNumber": pageNumber,
        "totalPages": totalPages,
        "pageSize": 10,
        "totalCount": exampleReviewIds.length,
        "reviews": reviews,
        "links": {
            "nextPage": pageNumber < totalPages ? `/reviews?page=${pageNumber + 1}` : undefined,
            "lastPage": `/reviews?page=${totalPages}`
        }
    });
});

app.get('/reviews/:id', (req, res, next) => {
    if (req.params.id in exampleReviews) {
        res.status(200).json(exampleReviews[req.params.id]);
    } else {
        res.status(404).json({ "message": `No review with id ${req.params.id} found` });
    }
});

app.post('/businesses/:id/reviews', (req, res, next) => {
    if (!req.params.id in exampleBusinesses) {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
        return;
    }

    const newReview = req.body
    const requiredFields = ["rating", "priceRating"]

    requiredFields.forEach(field => {
        if (!field in newReview) {
            res.status(400).json({ "message": "Invalid review object" })
        }
    });

    // Placeholder, doesn't actually store data
    res.status(201).json({
        "message": "successfully created",
        "review": {
            "id": 2934,
            "business": req.params.id,
            "user": 6,
            "rating": newReview.rating,
            "priceRating": newReview.priceRating,
            "comment": newReview.comment === undefined ? null : newReview.comment,
            "links": {
                "business": `/businesses/${req.params.id}`
            }
        },
        "link": `/reviews/2934`
    });
});

app.patch('/reviews/:id', (req, res, next) => {
    if (!req.params.id in exampleReviews) {
        res.status(404).json({ "message": `No review with id ${req.params.id} found` });
        return;
    }

    const updatedFields = req.body;
    const oldReview = exampleReviews[req.params.id];

    // Placeholder, doesn't actually update data
    let updatedReview = {
        "id": req.params.id,
        "business": oldReview.business,
        "user": oldReview.user,
        "rating": updatedFields.rating ?? oldReview.rating,
        "priceRating": updatedFields.priceRating ?? oldReview.priceRating,
        "comment": updatedFields.comment ?? oldReview.comment,
        "links": {
            "business": `/businesses/${req.params.id}`
        }
    };

    res.status(200).json({
        "message": "successfully updated",
        "review": updatedReview,
        "link": `/reviews/${req.params.id}`
    });
});

app.delete('/reviews/:id', (req, res, next) => {
    if (req.params.id in exampleReviews) {
        // Placeholder, doesn't actually delete data
        res.status(200).json({
            "message": "deleted successfully",
            "deleted": exampleReviews[req.params.id]
        });
    } else {
        res.status(404).json({ "message": `No review with id ${req.params.id} found` });
    }
});



// Photos endpoints
app.get('/businesses/:id/photos', (req, res, next) => {
    if (!req.params.id in exampleBusinesses) {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
        return;
    }

    const pageNumber = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    const totalPages = Math.ceil(examplePhotoIds.length / 10);
    const photoIds = examplePhotoIds.slice((pageNumber - 1) * 10, pageNumber * 10);
    const photos = [];

    photoIds.forEach(id => {
        photos.push(examplePhotos[id])
    })

    res.status(200).json({
        "pageNumber": pageNumber,
        "totalPages": totalPages,
        "pageSize": 10,
        "totalCount": examplePhotoIds.length,
        "photos": photos,
        "links": {
            "nextPage": pageNumber < totalPages ? `/businesses/${req.params.id}/photos?page=${pageNumber + 1}` : undefined,
            "lastPage": `/businesses/${req.params.id}/photos?page=${totalPages}`
        }
    });
});

app.get('/photos', (req, res, next) => {
    const pageNumber = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    const totalPages = Math.ceil(examplePhotoIds.length / 10);
    const photoIds = examplePhotoIds.slice((pageNumber - 1) * 10, pageNumber * 10);
    const photos = [];

    photoIds.forEach(id => {
        photos.push(examplePhotos[id])
    })

    res.status(200).json({
        "pageNumber": pageNumber,
        "totalPages": totalPages,
        "pageSize": 10,
        "totalCount": examplePhotoIds.length,
        "photos": photos,
        "links": {
            "nextPage": pageNumber < totalPages ? `/photos?page=${pageNumber + 1}` : undefined,
            "lastPage": `/photos?page=${totalPages}`
        }
    });
});

app.get('/photos/:id', (req, res, next) => {
    if (req.params.id in examplePhotos) {
        res.status(200).json(examplePhotos[req.params.id]);
    } else {
        res.status(404).json({ "message": `No photo with id ${req.params.id} found` });
    }
});

app.post('/businesses/:id/photos', (req, res, next) => {
    if (!req.params.id in exampleBusinesses) {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
        return;
    }

    const newPhoto = req.body

    // Placeholder, doesn't actually store data
    res.status(201).json({
        "message": "successfully created",
        "photo": {
            "id": 712,
            "business": req.params.id,
            "user": 85,
            "imageUrl": `/photoData/712`,
            "caption": newPhoto.caption === undefined ? null : newPhoto.caption,
            "links": {
                "business": `/businesses/${req.params.id}`
            }
        },
        "link": `/photos/712`
    });
});

app.patch('/photos/:id', (req, res, next) => {
    if (!req.params.id in examplePhotos) {
        res.status(404).json({ "message": `No photo with id ${req.params.id} found` });
        return;
    }

    const updatedFields = req.body;
    const oldPhoto = examplePhotos[req.params.id];

    // Placeholder, doesn't actually update data
    let updatedPhoto = {
        "id": oldPhoto.id,
        "business": oldPhoto.business,
        "user": oldPhoto.user,
        "imageUrl": oldPhoto.imageUrl,
        "caption": updatedFields.caption ?? oldPhoto.caption,
        "links": {
            "business": `/businesses/${req.params.id}`
        }
    };

    res.status(200).json({
        "message": "successfully updated",
        "photo": updatedPhoto,
        "link": `/reviews/${req.params.id}`
    });
});

app.delete('/photos/:id', (req, res, next) => {
    if (req.params.id in examplePhotos) {
        // Placeholder, doesn't actually delete data
        res.status(200).json({
            "message": "deleted successfully",
            "deleted": examplePhotos[req.params.id]
        });
    } else {
        res.status(404).json({ "message": `No photo with id ${req.params.id} found` });
    }
});
