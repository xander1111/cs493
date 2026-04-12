const express = require('express');

const app = express();
const port = process.env.PORT;

app.use(express.json());


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

function get_example_business(id = 1) {
    return {
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
        "email": null,
        "links": {
            "reviews": `/businesses/${id}/reviews`,
            "photos": `/businesses/${id}/photos`
        }
    }
}


// Businesses endpoints
app.get('/businesses', (req, res, next) => {
    const pageNumber = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    // Placeholder example data
    const businesses = [];
    if (pageNumber == 1) {
        for (let i = 1; i <= 10; i++) {
            businesses.push(get_example_business(i));
        }
    } else if (pageNumber == 2) {
        for (let i = 11; i <= 15; i++) {
            businesses.push(get_example_business(i));
        }
    }



    res.status(200).json({
        "pageNumber": pageNumber,
        "totalPages": 2,
        "pageSize": 10,
        "totalCount": 15,
        "businesses": businesses,
        "links": {
            "nextPage": pageNumber < 2 ? "/businesses?page=2" : undefined,
            "lastPage": "/businesses?page=2"
        }
    });
});

app.get('/businesses/:id', (req, res, next) => {
    // TODO
});

app.post('/businesses', (req, res, next) => {
    // TODO
});

app.patch('/businesses/:id', (req, res, next) => {
    // TODO
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
