import { Donaters, sendMsg, Texts } from './utils.js';


// --- Donaters list --- 
const DonatersInstance = new Donaters();
const donaterUsernames = await DonatersInstance.getList()
const secretVideos = DonatersInstance.getSecretVideos()

// --- Translation ---
const TextsInstance = new Texts();
const texts = TextsInstance.texts

// --- Telegram bot ---
export const handleCommonRequest = async (req, res) => {
    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;
    const username = req.body.message.from.username;

    if (text === '/start') {
        // Greet the user and tell them if they are whitelisted
        const isInWhitelist = donaterUsernames.includes('@' + username)
        if (!isInWhitelist) {
            let appeal = !!username ? username : req.body.message.from.firstName
            appeal = !!appeal ? ' ' + appeal : '' // with or without leading space
            const textForNonDonaters = `${texts.greeting}${appeal}! ${texts.notWhitelisted}`
            await sendMsg(chatId, textForNonDonaters)

        } else {
            speakWithDonater(chatId, username)
        }
    }

    res.send('ok');
}

// --- Donaters logic ---
const speakWithDonater = async (chat_id, username) => {
    // Greet the user
    await sendMsg(chat_id, `${texts.greeting} ${username}! ${texts.whitelisted}`)

    // Send secret videos
    await sendMsg(chat_id, texts.secretVideos)
    const promises = secretVideos.map(async (secretVideo) =>
        await sendMsg(chat_id, `${secretVideo.name}\n${secretVideo.url}`))

    await Promise.all(promises)
    await sendMsg(chat_id, texts.outro)
}



// Save whitelisted users to a file on server start
import fs from 'fs'
const filePath = './resources/donatersList.json'
if (!fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, JSON.stringify(donaterUsernames, null, 2))
}
