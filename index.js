import dotenv from 'dotenv'
dotenv.config()
import TelegramBot from 'node-telegram-bot-api'
import { TOKEN } from './config.js'
import { handleCommonRequest } from './controller.js';


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => handleCommonRequest(msg, bot));

