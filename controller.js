import logging from 'improved-logging';
import { Donaters } from './src/donaters.js';
import { Texts } from './src/texts.js';
import videos from './src/videos.js';

// --- Donaters list --- 
const DonatersInstance = new Donaters();
var donaterUsernames = await DonatersInstance.getDonaters()

// --- Translation ---
const TextsInstance = new Texts();
const texts = TextsInstance.texts


// --- Telegram bot ---
export const handleCommonRequest = async (message, bot) => {
    const chatId = message.chat.id;

    const text = message.text;

    let username = message.from.username
    if (!username)
        return speakWithNonDonater(message, chatId, username, bot)

    username = '@' + username.toLowerCase()
    logging.info('Touched by', message.from, 'with text', text)

    let isInWhitelist = DonatersInstance.checkUsername(username)
    if (text === '/start') {
        // Greet the user and tell them if they are whitelisted
        if (!isInWhitelist)
            speakWithNonDonater(message, chatId, username, bot)
        else
            speakWithDonater(chatId, username, bot)

    } else if (text === '/donate') {
        await bot.sendMessage(chatId, texts.donate)

    } else if (text === '/videos') {
        if (!isInWhitelist)
            return speakWithNonDonater(message, chatId, username, bot)

        // Send secret videos
        await bot.sendMessage(chatId, texts.secretVideos)
        const secretVideos = videos
        for (const video of secretVideos)
            await bot.sendMessage(chatId, `${video.name}\n${video.url}`)
    }
}

const speakWithNonDonater = async (message, chatId, username, bot) => {
    let appeal = !!username ? username : message.from.firstName
    appeal = !!appeal ? ' ' + appeal : '' // with or without leading space
    const textForNonDonaters = `${texts.greeting}${appeal}! ${texts.notWhitelisted} ${texts.supportBotUsername}`
    await bot.sendMessage(chatId, textForNonDonaters)

    tryWithContact(message, chatId, bot)
}


const tryWithContact = async (message, chatId, bot) => {
    // Try with contact
    var option = {
        "parse_mode": "Markdown",
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [[{
                text: "My phone number",
                request_contact: true
            }], ["Cancel"]]
        }
    };
    await bot.sendMessage(message.chat.id, texts.maybePhone, option)
    // handle user phone
    bot.once("contact", (message) => { handleContact(message, chatId, bot); })
}

const handleContact = async (message, chatId, bot) => {
    let receivedPhone = message?.contact?.phone_number
    const appeal = message.contact?.first_name
    await bot.sendMessage(message.chat.id,
        `Спасибо ${appeal}, ищу у себя в списке телефон ${receivedPhone} ...`)


    if (receivedPhone) {
        receivedPhone = receivedPhone.replace('+', '')
        const isInWhitelist = DonatersInstance.checkMobile(receivedPhone)
        if (isInWhitelist) {

            // Send secret videos
            await speakWithDonater(chatId, appeal, bot)

            await bot.sendMessage(chatId, texts.secretVideos)
            const secretVideos = videos
            for (const video of secretVideos)
                await bot.sendMessage(chatId, `${video.name}\n${video.url}`)

            return
        }
    }
    await bot.sendMessage(message.chat.id, `Не нашел телефон ${receivedPhone} в списке донатеров :( Если это ошибка, напиши ${texts.supportBotUsername}`)
}

// --- Donaters logic ---
const speakWithDonater = async (chatId, username, bot) => {
    // Greet the user
    await bot.sendMessage(chatId, `${texts.greeting} ${username}! ${texts.whitelisted}`)
    await bot.sendMessage(chatId, texts.outro)
}
