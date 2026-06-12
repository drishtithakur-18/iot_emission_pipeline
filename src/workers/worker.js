require('dotenv').config();
const { MongoClient } = require('mongodb');
const redisClient = require('../config/redis_client');

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/iot_pipeline';
let dbInstance;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        dbInstance = client.db();
        console.log("Worker successfully connected to MongoDB");
        return dbInstance;
    } catch (error) {
        console.error("Connection failed. Crashing worker.", error);
        process.exit(1);
    }
}

async function start_worker() {
    console.log("Worker listening for new telemetry data in Redis stream...");
    let lastId = '$';

    while (true) {
        try {
            // Future Note: can replace with consumer groups for better scaling and reliability
            const response = await redisClient.xRead(
                redisClient.commandOptions({ isolated: true }),
                [{ key: 'carbonemission_stream', id: lastId }],
                { BLOCK: 0, COUNT: 5 }
            );

            if (response && response.length > 0) {
                const messages = response[0].messages;

                const batch = [];

                // Process each message in the batch for poison pills
                for (const msg of messages) {
                    const raw = msg.message.payload;

                    try {
                        const data = JSON.parse(raw);

                        // Reject test poison-pill events
                        if (data.hardwareId === 'POISON') {
                            throw new Error("Simulated constraint failure");
                        }

                        data.ingestedAt = new Date();
                        batch.push(data);
                    } catch (err) {
                        // Route invalid records to DLQ
                        console.error(`[DLQ] Bad payload caught: ${err.message}`);

                        // Future Note: Move DLQ stream name to env config
                        await redisClient.xAdd('carbonemission_dlq', '*', {
                            payload: raw,
                            error: err.message,
                            failedAt: new Date().toISOString()
                        });
                    }
                }

                // Save valid records
                if (batch.length > 0) {
                    await dbInstance.collection('emissions').insertMany(batch);
                    console.log(`[WORKER] Saved ${batch.length} records`);
                }
                lastId = messages[messages.length - 1].id || '$';
            }
        } catch (error) {
            console.error("[WORKER ERROR]", error);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
connectDB().then(() => start_worker());