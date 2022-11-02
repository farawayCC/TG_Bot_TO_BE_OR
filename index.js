import dotenv from 'dotenv'
dotenv.config()

import TelegramBot from 'node-telegram-bot-api'

// replace the value below with the Telegram token you receive from @BotFather
import { TELEGRAM_API, WEBHOOK_URL, URI, TOKEN } from './config.js'
import { handleCommonRequest } from './controller.js';


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    handleCommonRequest(msg, bot)

    // send a message to the chat acknowledging receipt of their message
    // bot.sendMessage(chatId, 'Received your message');
});

