const express = require('express');

const app = express();
const port = 8086;

let pageVisitCounter = 0;


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/counter', (req, res, next) => {
    res.status(200).send(++pageVisitCounter);
});
