const express = require('express');

const app = express();
const port = 8086;

app.use(express.json());

let messages = [];


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/messages', (req, res, next) => {
    messagesJson = []

    for (let i = 0; i < messages.length; i++) {
        messagesJson.push({
            "id": i,
            "message": messages[i]
        });
    }

    res.status(200).json(messagesJson);
});

app.get('/messages/:id', (req, res, next) => {
    id = req.params.id;
    if (messages[id] == null) {
        res.status(404).json({
            "error": `Message ${id} not found`
        });
    }

    res.status(200).json({
        "id": id,
        "message": messages[id]
    });
});

app.post('/messages', (req, res, next) => {
    if (req.body.message == null) {
        res.status(400).json({
            "error": `'message' field not specified in request data`
        });
        return;
    }

    id = messages.push(req.body.message) - 1;

    res.status(201).json({
        "id": id,
        "links": {
            "self": `/messages/${id}`
        }
    });
});
