const express = require('express');

const app = express();
const port = process.env.PORT;

app.use(express.json());


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


// Generate placeholder example data
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
    });
});

app.patch('/businesses/:id', (req, res, next) => {
    if (!req.params.id in exampleBusinesses) {
        res.status(404).json({ "message": `No business with id ${req.params.id} found` });
        return;
    }

    const updatedFields = req.body;
    const oldBusiness = exampleBusinesses[req.params.id];

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

    res.status(200).json(updatedBusiness);
});

app.delete('/businesses/:id', (req, res, next) => {
    // TODO
});



// Reviews endpoints
app.get('/businesses/:id/reviews', (req, res, next) => {
    // TODO
});

app.get('/reviews', (req, res, next) => {
    // TODO
});

app.post('/businesses/:id/reviews', (req, res, next) => {
    // TODO
});

app.patch('/reviews/:id', (req, res, next) => {
    // TODO
});

app.delete('/reviews/:id', (req, res, next) => {
    // TODO
});



// Photos endpoints
app.get('/businesses/:id/photos', (req, res, next) => {
    // TODO
});

app.get('/photos', (req, res, next) => {
    // TODO
});

app.post('/businesses/:id/photos', (req, res, next) => {
    // TODO
});

app.patch('/photos/:id', (req, res, next) => {
    // TODO
});

app.delete('/photos/:id', (req, res, next) => {
    // TODO
});
