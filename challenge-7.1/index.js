"use strict";

const express = require('express');
const app = express();

const port = 8086;

const max_tokens = 3;
const accumulation_rate = 3 / 10000;  // 3 tokens per 10,000 ms
const rate_limit_buckets = {};

function rateLimit(req, res, next) {
    const time_now = Date.now();

    if (!rate_limit_buckets[req.ip]) {
        // First request from this IP, initialize bucket
        rate_limit_buckets[req.ip] = { tokens: max_tokens - 1, time: time_now };
        next();
        return;
    }

    const time_since_last_req = time_now - rate_limit_buckets[req.ip].time;
    const prev_tokens = rate_limit_buckets[req.ip].tokens;
    const updated_tokens = Math.min(prev_tokens + (accumulation_rate * time_since_last_req), max_tokens);  // Accumulate new tokens and limit to 3
    
    
    if (updated_tokens < 1) {
        res.status(429).send("TOO MANY REQUESTS\n");
    } else {
        rate_limit_buckets[req.ip].time = time_now;
        rate_limit_buckets[req.ip].tokens = updated_tokens - 1;
        next();
    }
}

app.get("/", rateLimit, async (req, res) => {
    res.send("Here's some data!\n");
});

app.listen(port, function () {
    console.log("== Server listening on port", port);
});
