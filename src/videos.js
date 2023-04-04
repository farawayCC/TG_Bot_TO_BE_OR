import fs from 'fs'


export default JSON.parse(fs.readFileSync('./resources/secretVideos.json'))
