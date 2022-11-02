import dotenv from 'dotenv'
dotenv.config()

export const TOKEN = process.env.TOKEN
export const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
export const SERVER_URL = process.env.SERVER_URL // This server (used because of ngrok :) )
export const URI = `/webhook/${TOKEN}`;
export const WEBHOOK_URL = SERVER_URL + URI;
