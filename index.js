import dotenv from 'dotenv'
dotenv.config()
import TelegramBot from 'node-telegram-bot-api'
import { TOKEN } from './config.js'
import { handleCommonRequest } from './controller.js';
import { checkPrerequisites } from './utils.js';
import FileUploadServer from './fileServer.js';


// Check all files are present
checkPrerequisites()

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => handleCommonRequest(msg, bot));


// --- New List Upload Server --- 
const server = new FileUploadServer(4000);
server.start();
