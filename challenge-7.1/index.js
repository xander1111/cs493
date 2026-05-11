"use strict";

const express = require('express');
const app = express();

const port = 8086;

function rateLimit(req, res, next) {
    // ### TODO ###

    // If rate limited:
    //     res.status(429).send("TOO MANY REQUESTS\n");
}

app.get("/", rateLimit, async (req, res) => {
    res.send("Here's some data!\n");
});

app.listen(port, function () {
    console.log("== Server listening on port", port);
});
