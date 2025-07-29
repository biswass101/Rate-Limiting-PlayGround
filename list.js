const client = require('./client');

async function init() {
//    await client.lpush('messages', 1)
//    await client.lpush('messages', 2)
//    await client.lpush('messages', 3)
//    await client.lpush('messages', 4)

   console.log(await client.rpop('messages'));
}

init();