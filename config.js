import dotenv from 'dotenv'
dotenv.config()

export const TOKEN = process.env.TOKEN
export const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

export const mainFileName = 'tg_rassilka_tochnii.rtf'
export const mainOutputPath = 'resources/donatersList.json'
