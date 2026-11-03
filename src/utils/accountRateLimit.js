const redis = require("../config/redis.config");
const IDENTITY_WINDOW_MS = 5 * 60_000;
const IDENTITY_LIMIT = 3;

const ACCOUNT_SCRIPT = `
local key = KEYS[1]
local cooldownKey = KEYS[2]
local violationsKey = KEYS[3]
local windowMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = redis.call('TIME')
local timestamp = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
if #KEYS >= 3 then
  local cooldownTtl = redis.call('PTTL', cooldownKey)
  if cooldownTtl > 0 then return {0, cooldownTtl} end
end
redis.call('ZREMRANGEBYSCORE', key, '-inf', timestamp - windowMs)
local count = redis.call('ZCARD', key)
if count >= limit then
  local first = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  if #KEYS < 3 then return {0, tonumber(first[2]) + windowMs - timestamp} end
  local violations = redis.call('INCR', violationsKey)
  redis.call('EXPIRE', violationsKey, 86400)
  local delay = math.min(900000, 1000 * (2 ^ math.min(violations - 1, 10)))
  redis.call('SET', cooldownKey, '1', 'PX', delay)
  return {0, delay}
end
redis.call('ZADD', key, timestamp, tostring(timestamp) .. ':' .. tostring(redis.call('INCR', key .. ':seq')))
redis.call('PEXPIRE', key, windowMs)
redis.call('PEXPIRE', key .. ':seq', windowMs)
return {1, 0}
`;

async function accountRateLimit(req, res, next, WINDOW_MS = 300_000, ACCOUNT_LIMIT = 100) {
  const accountId = req.user?._id || req.user?.userId || req.user?.id;
  if (!accountId) return next();

  try {
    const accountKey = `rate-limit:account:${String(accountId)}:5m`;
    const [allowed, retryMs] = await redis.eval(
      ACCOUNT_SCRIPT,
      3,
      accountKey,
      `${accountKey}:backoff`,
      `${accountKey}:violations`,
      WINDOW_MS,
      ACCOUNT_LIMIT,
    );
    if (!Number(allowed)) {
      res.set("Retry-After", String(Math.max(1, Math.ceil(Number(retryMs) / 1000))));
      return res.status(429).json({ status: "error", message: "Too many requests for this account. Please try again later." });
    }
    return next();
  } catch (error) {
    // Preserve service availability if the shared limiter store is temporarily unavailable.
    return next();
  }
}

async function identityRateLimit(req, res, next) {
  const body = req.body || {};
  // Authentication throttling is keyed only by the email supplied in the body.
  const identity = body.email;
  if (typeof identity !== "string" || !identity.trim()) return next();

  try {
    const [allowed, retryMs] = await redis.eval(
      ACCOUNT_SCRIPT,
      1,
      `rate-limit:auth:${identity.trim().toLowerCase()}:5m`,
      IDENTITY_WINDOW_MS,
      IDENTITY_LIMIT,
    );
    if (!Number(allowed)) {
      res.set("Retry-After", String(Math.max(1, Math.ceil(Number(retryMs) / 1000))));
      return res.status(429).json({ status: "error", message: "Too many requests for this account. Please try again later." });
    }
    return next();
  } catch (error) {
    return next();
  }
}

const LOGIN_COOLDOWN_SCRIPT = `
local cooldownKey = KEYS[1]
local failuresKey = KEYS[2]
local ttl = redis.call('PTTL', cooldownKey)
local failures = tonumber(redis.call('GET', failuresKey) or '0')
if ARGV[1] == 'check' then
  if ttl > 0 then return {failures, ttl} end
  if failures >= tonumber(ARGV[2]) then redis.call('DEL', failuresKey); failures = 0 end
  return {failures, 0}
end
if ARGV[1] == 'reset' then redis.call('DEL', cooldownKey, failuresKey); return {0, 0} end
failures = redis.call('INCR', failuresKey)
redis.call('PEXPIRE', failuresKey, tonumber(ARGV[3]))
if failures >= tonumber(ARGV[2]) then
  redis.call('SET', cooldownKey, '1', 'PX', tonumber(ARGV[3]))
  return {failures, tonumber(ARGV[3])}
end
return {failures, 0}
`;

const loginEmailKeys = (email) => {
  const readableEmail = String(email).trim().toLowerCase();
  return [`rate-limit:login:${readableEmail}:cooldown`, `rate-limit:login:${readableEmail}:failures`];
};

async function checkLoginEmailLimit(req, res, next) {
  const email = req.body?.email?.trim().toLowerCase();
  if (!email) return next();
  try {
    const [, retryMs] = await redis.eval(
      LOGIN_COOLDOWN_SCRIPT,
      2,
      ...loginEmailKeys(email),
      "check",
      IDENTITY_LIMIT,
      IDENTITY_WINDOW_MS,
    );
    if (Number(retryMs) > 0) {
      res.set("Retry-After", String(Math.max(1, Math.ceil(Number(retryMs) / 1000))));
      return res.status(429).json({ status: "error", message: "Too many failed login attempts. Please try again in 5 minutes." });
    }
    return next();
  } catch (error) {
    return next();
  }
}

async function recordLoginFailure(email) {
  if (!email) return;
  try {
    await redis.eval(LOGIN_COOLDOWN_SCRIPT, 2, ...loginEmailKeys(email), "fail", IDENTITY_LIMIT, IDENTITY_WINDOW_MS);
  } catch (error) {
    // IP limiting remains active if Redis is unavailable.
  }
}

async function clearLoginFailures(email) {
  if (!email) return;
  try {
    await redis.eval(LOGIN_COOLDOWN_SCRIPT, 2, ...loginEmailKeys(email), "reset");
  } catch (error) {
    // IP limiting remains active if Redis is unavailable.
  }
}

module.exports = { accountRateLimit, identityRateLimit, checkLoginEmailLimit, recordLoginFailure, clearLoginFailures };
