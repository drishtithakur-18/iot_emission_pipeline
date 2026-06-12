const Joi = require('joi');

// Defining the rules for incoming factory data
const Schema = Joi.object({
    hardwareId: Joi.string().required(),
    metricType: Joi.string().valid('kwh_consumed', 'amps_drawn', 'operational_celsius').required(),
    value: Joi.number().required(),
    timestamp: Joi.date().iso().required()
});
const sanitizePayload = (req, res, next) => {
    const { error } = Schema.validate(req.body);
    // Reject the request if it doesn't meet the criteria
    if (error) {
        console.error(`Invalid Data: ${error.details[0].message}`);
        return res.status(400).json({
            trackingState: 'REJECTED',
            reason: error.details[0].message
        });
    }
    // If the data is perfect let it pass
    next();
};
module.exports = sanitizePayload;