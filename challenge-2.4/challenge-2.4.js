const express = require('express');

const app = express();
const port = 8086;

app.use(express.json());

let messages = {};
let messageCount = 0;


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/messages', (req, res, next) => {
    res.status(200).json(Object.values(messages));
});

app.get('/messages/:id', (req, res, next) => {
    id = req.params.id;
    if (messages[id] == null) {
        res.status(404).json({
            "error": `Message ${id} not found`
        });
    }

    res.status(200).json(messages[id]);
});

app.post('/messages', (req, res, next) => {
    if (req.body.message == null) {
        res.status(400).json({
            "error": `'message' field not specified in request data`
        });
        return;
    }

    id = messageCount++;

    messages[id] = {
        "id": id,
        "message": req.body.message
    };

    res.status(201).json({
        "id": id,
        "links": {
            "self": `/messages/${id}`
        }
    });
});

app.delete('/messages/:id', (req, res, next) => {
    id = req.params.id;
    if (messages[id] == null) {
        res.status(404).json({
            "error": `Message ${id} not found`
        });
    }

    deletedMessage = messages[id];
    delete messages[id];

    res.status(200).json(deletedMessage);
});
