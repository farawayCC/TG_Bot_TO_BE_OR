import fs from 'fs'

export class Texts {
    texts

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