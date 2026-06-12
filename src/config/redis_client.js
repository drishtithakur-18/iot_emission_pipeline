const { createClient } = require('redis');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const client = createClient({
    url: REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

// Connect to the server
const connectRedis = async () => {
    try {
        await client.connect();
        console.log('Successfully connected to Redis');
    } catch (error) {
        console.error('Redis connection failed:', error);
    }
};
connectRedis();
module.exports = client;


