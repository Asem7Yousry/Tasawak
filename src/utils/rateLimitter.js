const { rateLimit } = require('express-rate-limit');
const SlidingWindowRedisStore = require('./slidingWindowRedisStore');
const redis = require('../config/redis.config');

const limiter = (limitRequests = 100, timeLimit = 5) => {
    return rateLimit({
        windowMs: timeLimit * 60 * 1000, // 5 minutes
        limit: limitRequests, // Limit each IP to 100 requests per `window` (here, per 5 minutes).
        standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
        ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
        store: new SlidingWindowRedisStore(redis, limitRequests, timeLimit),
        message: {
            status: 'error',
            message: 'Too many requests. Please try again later.',
        },
    })
}

module.exports = limiter
