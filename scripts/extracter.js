import fs from 'fs'
import path from 'path'
import csvParser from 'csv-parser'
import dotenv from 'dotenv'
import logging from 'improved-logging'
dotenv.config()


const mainOutputPath = 'resources/RAW_donatersList.json'

cleanFile('resources/newCSV.csv')


const allToLowerCase = (array) => array.map(item => item.toLowerCase())
const previousJSONList = JSON.parse(fs.readFileSync('resources/donatersList.json', 'utf8'))
fs.writeFileSync('resources/donatersList2.json', JSON.stringify(allToLowerCase(previousJSONList)))

/**
 * @param {*} mainFileName path to a CSV file with the list of donaters. Header should be "Users"
 */
async function cleanFile(mainFileName) {
    let wrongList = []

    let filedata = await getDocContent(mainFileName)
    filedata = filedata.map(item => {
        return item['Users']
    })

    // Combine the previous list with the new one
    filedata = filedata.concat(previousJSONList)

    const isWithoutSpaces = (item) => !item.includes(' ')
    const isShortEnough = (item) => item.length !== 1
    const isNotWithCyrillicLetters = (item) => !/[а-яА-Я]/.test(item)
    const isNotEmail = (item) => item.count('@') <= 1
    const isWithoutDots = (item) => !item.includes('.')

    // split the list into two: correct and wrong, so that we can save them separately
    const objectWrongAndCorrect = { wrong: [], correct: [] }
    filedata.forEach(item => {
        if (
            isWithoutSpaces(item)
            && isShortEnough(item)
            && isNotWithCyrillicLetters(item)
            && isNotEmail(item)
            && isWithoutDots(item)
        ) {
            objectWrongAndCorrect.correct.push(item)
        } else {
            objectWrongAndCorrect.wrong.push(item)
        }
    })
    wrongList = wrongList.concat(objectWrongAndCorrect.wrong)
    filedata = objectWrongAndCorrect.correct


    // remove duplicates
    filedata = [...new Set(filedata)]

    // save the list to a file
    if (fs.existsSync(mainOutputPath))
        fs.unlinkSync(mainOutputPath);
    fs.writeFileSync(mainOutputPath, JSON.stringify(filedata))

    // save wrong list to a file
    const wrongListPath = 'resources/wrongList.json'
    if (fs.existsSync(wrongListPath))
        fs.unlinkSync(wrongListPath);
    fs.writeFileSync(wrongListPath, JSON.stringify(wrongList))

    logging.success(`Done! The list of donaters (${filedata.length}) is saved to ${mainOutputPath}. The list of wrong donaters is saved to ${wrongListPath}.`)

    return filedata
}


async function getDocContent(mainFileName) {
    return new Promise((resolve, reject) => {
        const rows = []
        fs.createReadStream(mainFileName)
            .pipe(csvParser())
            .on('data', (row) => {
                rows.push(row)
            })
            .on('end', () => {
                logging.success('CSV file successfully processed');
                resolve(rows)
            })
            .on('error', (err) => {
                logging.error('Error while processing CSV file', err);
                reject(err)
            })
    })
}

function extractPhoneNumbers(donatersListDirty) {
    const startStringForTelephones = '"Телефон",'
    const telephonesIndex = donatersListDirty.indexOf(startStringForTelephones)
    // telephones text = from telephonesIndex to the end of the string
    let telephonesText = donatersListDirty.slice(telephonesIndex + startStringForTelephones.length, donatersListDirty.length)
    telephonesText = telephonesText.replace(',null]', '')
    telephonesText = telephonesText

    logging.warn('---In case new phones are added, please update the list in ./resources/telephones.json with the following data---')
    logging.warn(telephonesText)
    logging.warn('Please fill them manually into the file ./resources/telephones.json as an array of strings')
    console.log()
}


// extend string prototype with .count() method
String.prototype.count = function (c) {
    var result = 0, i = 0;
    for (i; i < this.length; i++) if (this[i] == c) result++;
    return result;
}
