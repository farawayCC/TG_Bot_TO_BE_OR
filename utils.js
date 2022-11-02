import parseRTF from 'rtf-parser'
import fs from 'fs'


export class Donaters {
    donatersWhitelistPromise // Parsed list from ./resources/tg_rassilka_tochnii.rtf. WITHOUT TELEPHONES!
    secretVideos // Parsed list from ./resources/secretVideos.json

    constructor() {
        this.donatersWhitelistPromise = this.constructTheList();
        this.secretVideos = this.constructSecretVideosList();
        const phonesPath = './resources/telephones.json'
        this.phoneNumbers = fs.existsSync(phonesPath) ? JSON.parse(fs.readFileSync(phonesPath)) : null
    }

    async constructTheList() {
        const getDocContent = () => {
            return new Promise((resolve, reject) => {
                parseRTF.stream(fs.createReadStream('./resources/tg_rassilka_tochnii.rtf'), (err, doc) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(doc.content)
                })
            })
        }
        const docContent = await getDocContent()
        let donatersListDirty = docContent.map((item) => {
            return item.content[0]?.value
        })

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
        console.log("This is a telephonesText", telephonesText)
        console.log('Please fill them manually into the file ./resources/telephones.json as an array of strings')
    }

    constructSecretVideosList() {
        const secretVideos = JSON.parse(fs.readFileSync('./resources/secretVideos.json'))
        return secretVideos
    }

    getList() {
        return this.donatersWhitelistPromise;
    }

    getSecretVideos() {
        return this.secretVideos;
    }

    getPhoneNumbers() {
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


