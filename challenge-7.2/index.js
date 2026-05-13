"use strict";

const express = require('express');
const app = express();

const port = 8086;

const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

const redisClient = redis.createClient({
    url: `redis://${redisHost}:${redisPort}`
});

const max_tokens = 3;
const accumulation_rate = 3 / 10000;  // 3 tokens per 10,000 ms

async function rateLimit(req, res, next) {
    const time_now = Date.now();

    const bucket_exists = await redisClient.exists(req.ip);

    if (!bucket_exists) {
        // First request from this IP, initialize bucket
        await redisClient.hSet(req.ip, { tokens: max_tokens - 1, time: time_now });
        next();
        return;
    }

    const last_req = await redisClient.hGetAll(req.ip);

    const time_since_last_req = time_now - parseInt(last_req.time);
    const prev_tokens = parseInt(last_req.tokens);
    const updated_tokens = Math.min(prev_tokens + (accumulation_rate * time_since_last_req), max_tokens);  // Accumulate new tokens and limit to 3    

    if (updated_tokens < 1) {
        res.status(429).send("TOO MANY REQUESTS\n");
    } else {
        const result = await redisClient.hSet(req.ip, { tokens: updated_tokens - 1, time: time_now });
        next();
    }
}

app.get("/", rateLimit, async (req, res) => {
    res.send("Here's some data!\n");
});

redisClient.connect().then(() => {
    app.listen(port, () => {
        console.log("== Server listening on port", port);
    });
})
