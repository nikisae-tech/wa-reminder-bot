const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./src/config/config');
const db = require('./src/database/db');
const path = require('path');

const app = express();
let lastQR = '';

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, './data')
    }),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    lastQR = qr;
    console.log('QR Code received');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// Basic routes
app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.get('/qr', (req, res) => {
    if (lastQR) {
        res.send(`<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(lastQR)}&size=300x300" />`);
    } else {
        res.send('No QR code available');
    }
});

// Initialize bot and server
client.initialize();

const port = config.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
