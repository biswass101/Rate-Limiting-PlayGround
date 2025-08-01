const {Redis} = require('ioredis');
const express = require('express');

const redis = new Redis();
const app = express();
const PORT = 3001;


const BUCKET_KEY = "token_bucket";
const CAPPACITY = 10;
const REFILL_RATE = 5000;

setInterval(async() => {
    let tokens = await redis.get(BUCKET_KEY);
    tokens = tokens ? parseInt(tokens) : CAPPACITY;

    let newTokens = Math.min(tokens + 1, CAPPACITY);
    await redis.set(BUCKET_KEY, newTokens);
    console.log("Total tokens in bucket:", newTokens);
}, REFILL_RATE)

app.get('/rate-limit', async (req, res) => {
    let tokens = await redis.get(BUCKET_KEY);
    tokens = tokens ? parseInt(tokens) : CAPPACITY;
    if(tokens > 0) {
        await redis.decr(BUCKET_KEY);
        return res.status(200).json({message: "Request allowed"});
    }
    res.status(429).json({message: "Too many requests"});
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Token bucket rate limiting started with capacity ${CAPPACITY} and refill rate ${REFILL_RATE}ms`);
})