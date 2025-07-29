const { Redis } = require('ioredis');
const express = require('express');

const redis = new Redis();
const app = express();
const PORT = 3000;

//Rate limit variable
const BUCKET_KEY = "leaky_bucket"
const CAPACITY = 10; 
const LEAK_RATE = 5000 //leak 1 request per 5 second

setInterval(async() => {
    const count = await redis.llen(BUCKET_KEY);
    if (count > 0) await redis.rpop(BUCKET_KEY);
    console.log(`Leaked 1 request, current count: ${count - 1}`);
}, LEAK_RATE);

app.get('/rate-limit', async (req, res) => {
    const count = await redis.llen(BUCKET_KEY);
    if(count < CAPACITY) {
        await redis.lpush(BUCKET_KEY, Date.now());
        res.status(200).json({message: "Request allowed"});
    } else {
        res.status(429).json({message: "Too many requests"});
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT}`);
    console.log(`Leaky bucket rate limiting started with capacity ${CAPACITY} and leak rate ${LEAK_RATE}ms`);
})