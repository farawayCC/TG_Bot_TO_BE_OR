import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { mainFileName } from './config.js';
dotenv.config();

/**
 * This class is a simple server that listens for file uploads.
 * And hosts a simple form to upload files on /upload.
 */
export default class FileUploadServer {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded());
        this.app.post('/upload', this.handleFileUpload.bind(this));
        this.app.get('/upload', this.renderUploadForm.bind(this));
    }

    handleFileUpload(req, res) {
        const secretToken = req.body.secret_token;
        if (secretToken !== process.env.ADMIN_SECRET)
            return res.sendStatus(403);

        const rtfFileBase64 = req.body.rtf_file;
        const rtfFileBuffer = Buffer.from(rtfFileBase64, 'base64');
        const fileName = `${Date.now()}.rtf`;

        if (!fs.existsSync('backups')) fs.mkdirSync('backups');
        const mainFilePath = path.join('resources', mainFileName);

        // backup the old file
        const backupFile = path.join('backups', fileName + new Date().toISOString());
        fs.renameSync(mainFilePath, backupFile);

        // write the new file
        fs.writeFile(mainFilePath, rtfFileBuffer, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.sendStatus(500);
            } else {
                console.log('File saved successfully.');
                res.sendStatus(200);
            }
        });
    }

    renderUploadForm(req, res) {
        const htmlPath = path.join('uploadForm.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf-8')
        res.send(htmlContent);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server started to listen for forms ${this.port}.`);
        });
    }
}