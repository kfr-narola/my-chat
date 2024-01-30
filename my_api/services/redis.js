const redis = require('redis');
const redis_config = require('../config/redis.json');
const client = redis.createClient(redis_config.HOST, redis_config.PORT);

client.on('error', (err) => console.log('Redis Client Error', err));

main().catch(err => {
  console.log(err)
});

async function main(){
  await client.connect().then((response) => {
    console.log("Redis connected successfully.");
  });
}

module.exports = client