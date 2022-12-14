import { Donaters, Texts } from './utils.js';
import fs from 'fs'

// --- Donaters list --- 
const DonatersInstance = new Donaters();
const donaterUsernames = await DonatersInstance.getList()
const donaterTelephones = DonatersInstance.getPhoneNumbers()
const secretVideos = DonatersInstance.getSecretVideos()

// --- Translation ---
const TextsInstance = new Texts();
const texts = TextsInstance.texts

// --- File logic ---
// Save whitelisted users to a file on server start
const filePath = './resources/donatersList.json'
if (fs.existsSync(filePath))
    fs.unlinkSync(filePath);
fs.writeFileSync(filePath, JSON.stringify(donaterUsernames, null, 2))


// --- Telegram bot ---
export const handleCommonRequest = async (message, bot) => {
    const chatId = message.chat.id;

    const text = message.text;
    const username = message.from.username;
    console.log('Touched by', message.from, 'with text', text)

    const isInWhitelist = donaterUsernames.includes('@' + username)
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
    const receivedPhone = message?.contact?.phone_number
    const appeal = message.contact?.first_name
    await bot.sendMessage(message.chat.id,
        `?????????????? ${appeal}, ?????? ?? ???????? ?? ???????????? ?????????????? ${receivedPhone} ...`)

    if (donaterTelephones && donaterTelephones.length > 0 && receivedPhone) {
        const isInWhitelist = donaterTelephones.includes(receivedPhone)
        if (isInWhitelist)
            return speakWithDonater(chatId, appeal, bot)
    }
    await bot.sendMessage(message.chat.id, `???? ?????????? ?????????????? ${receivedPhone} ?? ???????????? ?????????????????? :( ???????? ?????? ????????????, ???????????? ${texts.supportBotUsername}`)
}

// --- Donaters logic ---
const speakWithDonater = async (chatId, username, bot) => {
    // Greet the user
    await bot.sendMessage(chatId, `${texts.greeting} ${username}! ${texts.whitelisted}`)
    await bot.sendMessage(chatId, texts.outro)
}
