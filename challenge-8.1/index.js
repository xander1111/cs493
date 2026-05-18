const express = require('express');

const multer = require('multer');
const upload = multer({ dest: './uploads/' });

const app = express();
const port = 8086

let fileinfo = {};

app.get('/', (req, res) => {
    res.send("Hello, world!");
});

app.post('/thing', upload.single('thingdata'), (req, res) => {
    fileinfo = req.file;
    res.status(201).send("data uploaded successfully");
});

app.get('/thing', (req, res) => {
    if (!(fileinfo.path)) {
        res.status(400).send("No data");
        return;
    }

    res.type(fileinfo.mimetype);
    res.status(200).sendFile(fileinfo.path, { root: '.' });
});

app.get('/upload', (req, res) => {
    res.type('html').send(`<h1>Upload some data</h1>
        <form method="POST" action="/thing" enctype="multipart/form-data">
            <input type="file" name="thingdata">
            <button type="submit">Upload</button>
        </form>`);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

