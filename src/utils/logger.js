const env = require('../config/environment');

const isDev = env.NODE_ENV === 'development';

const formatMessage = (level, message, meta) => {
    const base = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    if (!meta) return base;
    return `${base} | ${JSON.stringify(meta)}`;
};

const logger = {
    info(message, meta) {
        console.log(formatMessage('info', message, meta));
    },

    warn(message, meta) {
        console.warn(formatMessage('warn', message, meta));
    },

    error(message, meta) {
        // In dev, keep full error stack if provided
        if (meta instanceof Error) {
            const err = meta;
            console.error(
                formatMessage('error', message, {
                    name: err.name,
                    message: err.message,
                    ...(isDev && { stack: err.stack })
                })
            );
        } else {
            console.error(formatMessage('error', message, meta));
        }
    },

    debug(message, meta) {
        if (!isDev) return;
        console.debug(formatMessage('debug', message, meta));
    }
};

module.exports = logger;

