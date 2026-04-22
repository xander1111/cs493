const express = require('express');

const app = express();
const port = 8086;

const mysql = require('mysql2/promise');

const mysql_host = process.env.MYSQL_HOST || 'localhost';
const mysql_port = process.env.MYSQL_PORT || '3306';
const mysql_db = process.env.MYSQL_DB || 'messagesdb';
const mysql_user = process.env.MYSQL_USER || 'messagesuser';
const mysql_password = process.env.MYSQL_PASSWORD;

const mysqlPool = mysql.createPool({
    connectionLimit: 10,
    host: mysql_host,
    port: mysql_port,
    database: mysql_db,
    user: mysql_user,
    password: mysql_password
});

async function init_db() {
    await mysqlPool.query("drop table if exists messages");

    await mysqlPool.query(`create table messages (
        id integer primary key auto_increment,
        message varchar(512)
    )`);
}

init_db();

app.use(express.json());


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get('/messages', async (req, res, next) => {
    const [ response ] = await mysqlPool.query(`SELECT id, message FROM messages`);
    res.status(200).json({ messages: response });
});

app.get('/messages/:id', async (req, res, next) => {
    id = req.params.id;
    const [ response ] = await mysqlPool.query(`SELECT id, message FROM messages
        WHERE id = ?`, id);

    if (!response[0]) {
        res.status(404).json({
            "error": `Message ${id} not found`
        });
        return;
    }

    res.status(200).json({ message: response[0].message });
});

app.post('/messages', async (req, res, next) => {
    if (req.body.message == null) {
        res.status(400).json({
            "error": `'message' field not specified in request data`
        });
        return;
    }

    const [ result ] = await mysqlPool.query(`INSERT INTO messages (message) VALUES (?)`, req.body.message);

    res.status(201).json({
        "id": result.insertId,
        "links": {
            "self": `/messages/${result.insertId}`
        }
    });
});

app.delete('/messages/:id', async (req, res, next) => {
    id = req.params.id;
    const [ result ] = await mysqlPool.query(`DELETE FROM messages WHERE id = ?`, id);

    if (result.affectedRows === 0) {
        res.status(404).json({ "error": `Message ${id} not found` });
        return;
    }

    res.status(200).json({ "message": "Deleted successfully" });
});
