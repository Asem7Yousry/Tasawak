const { randomUUID } = require('node:crypto');

const INCREMENT_SCRIPT = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local member = ARGV[3]
local time = redis.call('TIME')
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local cutoff = now - windowMs

redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
local count = redis.call('ZCARD', key)
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')

if count >= limit then
  return {count + 1, tonumber(oldest[2]) + windowMs}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, windowMs * 2)
oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
return {count + 1, tonumber(oldest[2]) + windowMs}
`;

const GET_SCRIPT = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local time = redis.call('TIME')
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - windowMs)
local count = redis.call('ZCARD', key)
if count == 0 then return {0, 0} end
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
return {count, tonumber(oldest[2]) + windowMs}
`;

class SlidingWindowRedisStore {
    constructor(redis, limit, timeLimit, prefix = 'rl:sliding:') {
        this.redis = redis;
        this.limit = limit;
        this.prefix = prefix;
        this.windowMs = timeLimit * 60 * 1000;
        this.localKeys = false;
    }

    init(options) {
        this.windowMs = options.windowMs;
    }

    async increment(key) {
        const [totalHits, resetAt] = await this.redis.eval(
            INCREMENT_SCRIPT,
            1,
            this.prefix + key,
            this.windowMs,
            this.limit,
            randomUUID(),
        );
        return { totalHits: Number(totalHits), resetTime: new Date(Number(resetAt)) };
    }

    async get(key) {
        const [totalHits, resetAt] = await this.redis.eval(
            GET_SCRIPT,
            1,
            this.prefix + key,
            this.windowMs,
        );
        if (Number(totalHits) === 0) return undefined;
        return { totalHits: Number(totalHits), resetTime: new Date(Number(resetAt)) };
    }

    async decrement(key) {
        await this.redis.zpopmax(this.prefix + key, 1);
    }

    async resetKey(key) {
        await this.redis.del(this.prefix + key);
    }

    async resetAll() {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await this.redis.scan(
                cursor,
                'MATCH',
                `${this.prefix}*`,
                'COUNT',
                500,
            );
            cursor = nextCursor;
            if (keys.length) await this.redis.del(...keys);
        } while (cursor !== '0');
    }
}

module.exports = SlidingWindowRedisStore;
