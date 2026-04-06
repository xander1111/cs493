const express = require('express');

const app = express();
const port = 8086;

app.use(express.json());


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/', (req, res, next) => {
    res.status(200);
    res.send("Hello world!");
});

app.post('/input', (req, res, next) => {
    console.log(req.body);

    res.status(200);
    res.json({ message: "Hello world!" });
})

