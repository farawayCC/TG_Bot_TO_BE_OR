import { Donaters, Texts } from './utils.js';


// --- Donaters list --- 
const DonatersInstance = new Donaters();
const donaterUsernames = await DonatersInstance.getList()
const donaterTelephones = DonatersInstance.getPhoneNumbers()
const secretVideos = DonatersInstance.getSecretVideos()

// --- Translation ---
const TextsInstance = new Texts();
const texts = TextsInstance.texts

// --- Telegram bot ---
export const handleCommonRequest = async (message, bot) => {
    const chatId = message.chat.id;

    const text = message.text;
    const username = message.from.username;
    console.log('Touched by', message.from, 'with text', text)

    if (text === '/start') {
        // Greet the user and tell them if they are whitelisted
        const isInWhitelist = donaterUsernames.includes('@' + username)
        if (!isInWhitelist) {
            speakWithNonDonater(message, chatId, username, bot)
        } else {
            speakWithDonater(chatId, username, bot)
        }
    } else if (text === '/donate') {
        bot.sendMessage(chatId, texts.donate)

    } else if (text === '/videos') {
        // Send secret videos
        bot.sendMessage(chatId, texts.secretVideos)
        const promises = secretVideos.map(async (secretVideo) =>
            bot.sendMessage(chatId, `${secretVideo.name}\n${secretVideo.url}`))
        await Promise.all(promises)
    }
}

const speakWithNonDonater = async (message, chatId, username, bot) => {
    let appeal = !!username ? username : message.from.firstName
    appeal = !!appeal ? ' ' + appeal : '' // with or without leading space
    const textForNonDonaters = `${texts.greeting}${appeal}! ${texts.notWhitelisted} ${texts.supportBotUsername}`
    bot.sendMessage(chatId, textForNonDonaters)

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
    bot.sendMessage(message.chat.id, texts.maybePhone, option)
        .then(() => {
            // handle user phone
            bot.once("contact", (message) => { handleContact(message, chatId, bot); })
        })
}

const handleContact = async (message, chatId, bot) => {
    const receivedPhone = message?.contact?.phone_number
    const appeal = message.contact?.first_name
    await bot.sendMessage(message.chat.id,
        `Спасибо ${appeal}, ищу у себя в списке телефон ${receivedPhone} ...`)

    if (donaterTelephones && donaterTelephones.length > 0 && receivedPhone) {
        const isInWhitelist = donaterTelephones.includes(receivedPhone)
        if (isInWhitelist)
            return speakWithDonater(chatId, appeal, bot)
    }
    bot.sendMessage(message.chat.id, `Не нашел телефон ${receivedPhone} в списке донатеров :( Если это ошибка, напиши ${texts.supportBotUsername}`)
}

// --- Donaters logic ---
const speakWithDonater = async (chatId, username, bot) => {
    // Greet the user
    bot.sendMessage(chatId, `${texts.greeting} ${username}! ${texts.whitelisted}`)
    bot.sendMessage(chatId, texts.outro)
}



// Save whitelisted users to a file on server start
import fs from 'fs'
const filePath = './resources/donatersList.json'
if (!fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, JSON.stringify(donaterUsernames, null, 2))
}
