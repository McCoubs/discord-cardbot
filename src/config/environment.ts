export const environment = require('../../config.json');
environment.mode = process.env.DISCORDBOT_MODE || 'publisher';
environment.version = process.env.BOT_VERSION || '0.0.0';
