const express = require('express');
const redisClient = require('./config/redis_client');
const sanitizePayload = require('./core_filters/ingest_sanitizer');

const app = express();
app.use(express.json());

app.post('/factory-api/v1/submit-metrics', sanitizePayload, async (req, res) => {
    try {
        // Adding payload to telemetry stream in Redis
        await redisClient.xAdd('carbonemission_stream', '*', {
            payload: JSON.stringify(req.body)
        });

        console.log('Data has been pushed to Redis stream');

        return res.status(202).json({
            trackingState: 'QUEUED',
            timestamp: new Date().toISOString()
        });

    }
    catch (error) {
        // Handle failure and crashing if Redis goes offline
        console.error('Failed to push to Redis stream:', error);

        return res.status(500).json({
            trackingState: 'FAILED',
            message: 'Internal broker error. Please retry.'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});
