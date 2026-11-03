module.exports = getAllowedOriginsFromEnv = (originsString) => originsString
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
        try {
            return new URL(origin).origin;
        } catch {
            throw new Error(`Invalid CORS origin: ${origin}`);
        }
    });
