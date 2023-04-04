import parseRTF from 'rtf-parser'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { mainFileName, mainOutputPath } from '../config.js'
import logging from 'improved-logging'
dotenv.config()

export class Donaters {
    donaters // array of donaters
    telephones // array of telephones

    constructor(filePath = 'resources/donatersList.json') {
        this.donaters = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        logging.info('Donaters length:', this.donaters.length)

        this.telephones = JSON.parse(fs.readFileSync('resources/telephones.json', 'utf8'))
        logging.info('Telephones length:', this.telephones.length)
    }

    addDonater(donater) {
        this.donaters.push(donater)
    }

    getDonaters() {
        return this.donaters
    }

    checkUsername(username) {
        return this.donaters.includes(username)
    }

    checkMobile(mobile) {
        return this.telephones.includes(mobile)
    }
}
