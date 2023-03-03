import parseRTF from 'rtf-parser'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { mainFileName } from './config.js'
import dotenv from 'dotenv'
dotenv.config()


export const checkPrerequisites = () => {
    if (!process.env.TOKEN) {
        console.log('Error: Specify token in environment')
        process.exit(1)
    }
    const donatersFilePath = path.join('resources', mainFileName)
    const videosFilePath = path.join('resources', 'secretVideos.json')
    if (!fs.existsSync(donatersFilePath)) {
        console.log(`Error: File ${donatersFilePath} not found`)
        process.exit(1)
    }
    if (!fs.existsSync(videosFilePath)) {
        console.log(`Error: File ${videosFilePath} not found`)
        process.exit(1)
    }
}

export class Donaters {
    donatersWhitelistPromise // Parsed list from ./resources/tg_rassilka_tochnii.rtf
    secretVideos // Parsed list from ./resources/secretVideos.json

    fileHex = null // Hash of the file ./resources/tg_rassilka_tochnii.rtf

    constructor() {
        this.reloadValues()
    }

    reloadValues() {
        this.donatersWhitelistPromise = this.constructTheList();
        this.secretVideos = this.constructSecretVideosList();
        const phonesPath = './resources/telephones.json'
        this.phoneNumbers = fs.existsSync(phonesPath) ? JSON.parse(fs.readFileSync(phonesPath)) : null
    }

    async constructTheList() {
        const getDocContent = () => {
            return new Promise((resolve, reject) => {
                parseRTF.stream(fs.createReadStream('./resources/' + mainFileName), (err, doc) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(doc.content)
                })
            })
        }
        const docContent = await getDocContent()
        let donatersListDirty = docContent.map((rtfParagraph) => {
            if (rtfParagraph.content.length > 0)
                return rtfParagraph.content.map((rtfSpan) => rtfSpan.value)
        })
        donatersListDirty = donatersListDirty.flat()

        // Remove Telephones from the list
        donatersListDirty = JSON.stringify(donatersListDirty)
        this.extractPhoneNumbers(donatersListDirty)
        donatersListDirty = donatersListDirty.replace(/,"Телефон".*/g, '') + ']' // get rid of everything followed after ',"Телефон"
        donatersListDirty = JSON.parse(donatersListDirty)

        const itemIsTGUsername = (item) => {
            const donater = item.trim()
            const isTDotMeLink = donater.match(/t\.me\/\w+/) // link t.me/ followed by any string
            const isNormalUsername = donater.startsWith('@')
            const validTGUsername = isNormalUsername || isTDotMeLink
            return validTGUsername;
        }
        const oneTGUsernameStyle = (item) =>
            item.includes('t.me')
                ? item.replace(/.*t\.me\//, '@')
                : item

        const detachMultipleTGUsernames = (item) => item.includes(' ') ? item.split(' ') : item

        let beautifiedList = donatersListDirty
            .filter(item => !!item)
            .filter(itemIsTGUsername)
            .filter(item => item.length !== 1)
            .map(item => item.trim())
            .map(oneTGUsernameStyle)
            .map(detachMultipleTGUsernames)// detach usernames that have spaces in them
            .flat()


        // remove duplicates
        const uniqueList = [...new Set(beautifiedList)]

        return uniqueList
    }

    extractPhoneNumbers(donatersListDirty) {
        const startStringForTelephones = '"Телефон",'
        const telephonesIndex = donatersListDirty.indexOf(startStringForTelephones)
        // telephones text = from telephonesIndex to the end of the string
        let telephonesText = donatersListDirty.slice(telephonesIndex + startStringForTelephones.length, donatersListDirty.length)
        telephonesText = telephonesText.replace(',null]', '')
        telephonesText = telephonesText

        console.log('---In case new phones are added, please update the list in ./resources/telephones.json with the following data---')
        console.log(telephonesText)
        console.log('Please fill them manually into the file ./resources/telephones.json as an array of strings')
        console.log()
    }

    constructSecretVideosList() {
        const secretVideos = JSON.parse(fs.readFileSync('./resources/secretVideos.json'))
        return secretVideos
    }

    /**
     * Checks the file ./resources/tg_rassilka_tochnii.rtf for changes. If it was changed, reloads the list of donaters
     */
    checkIfMainFileHashChanged() {
        const donatersFilePath = path.join('resources', mainFileName)
        const fileBuffer = fs.readFileSync(donatersFilePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);

        const hex = hashSum.digest('hex');
        const wasChanged = !!hex && hex !== this.fileHex
        this.fileHex = hex
        if (wasChanged) {
            console.log('Main file was changed. Reloading the list of donaters')
            this.reloadValues()
        }
    }

    getList() {
        this.checkIfMainFileHashChanged()
        return this.donatersWhitelistPromise;
    }

    getSecretVideos() {
        this.checkIfMainFileHashChanged()
        return this.secretVideos;
    }

    getPhoneNumbers() {
        this.checkIfMainFileHashChanged()
        return this.phoneNumbers;
    }
}


export class Texts {

    constructor() {
        this.texts = this.readTextsFromFile();
    }

    readTextsFromFile() {
        const texts = JSON
            .parse(fs.readFileSync('./resources/texts.json'))
            .general
        return texts
    }
}

