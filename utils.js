import fs from 'fs'
import path from 'path'
import { mainFileName } from './config.js'
import dotenv from 'dotenv'
import logging from 'improved-logging'
dotenv.config()


export const checkPrerequisites = () => {
    if (!process.env.TOKEN) {
        logging.error('Error: Specify token in environment')
        process.exit(1)
    }
    const donatersFilePath = path.join('resources', mainFileName)
    const videosFilePath = path.join('resources', 'secretVideos.json')
    if (!fs.existsSync(donatersFilePath)) {
        logging.error(`Error: File ${donatersFilePath} not found`)
        process.exit(1)
    }
    if (!fs.existsSync(videosFilePath)) {
        logging.error(`Error: File ${videosFilePath} not found`)
        process.exit(1)
    }
}
