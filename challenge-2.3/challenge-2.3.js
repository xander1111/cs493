// This is not a secure way of doing passwords at all; demo purposes
// only!

const express = require('express')
const app = express();

app.use(express.json());

const port = 8086;

const server = app.listen(port, () => {
    console.log(`== Server is listening on port ${port}`);
});

server.on('error', (err) => {
    console.error("== Server encountered an error:", err);
});

function auth(req, res, next) {
    if (req.query.password == "pencil") {
        next();
    } else {
        res.status(403).send({ "error": "access denied" });
    }
}

app.get("/a", (req, res, next) => {
    res.send({ "a": 1 });
});

app.get("/b", auth, (req, res, next) => {
    res.send({ "b": 2 });
});

app.get("/c", auth, (req, res, next) => {
    res.send({ "c": 3 });
});

app.get("/d", auth, (req, res, next) => {
    res.send({ "d": 4 });
});