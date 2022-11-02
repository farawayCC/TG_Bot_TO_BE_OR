import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios';
import { handleCommonRequest } from './controller.js'
import { TELEGRAM_API, WEBHOOK_URL, URI } from './config.js'


const app = express();
app.use(bodyParser.json());

app.post(URI, handleCommonRequest);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server is listening on port ${PORT}`);

    // Set webhook
    const responseWH = await axios
        .get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log('Webhook response:', responseWH.data);
});

export default app
