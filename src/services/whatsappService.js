const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

class WhatsAppService {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: path.join(__dirname, '../../data')
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

        this.initializeClient();
    }

    initializeClient() {
        this.client.on('qr', (qr) => {
            console.log('QR RECEIVED');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('Client is ready!');
        });

        this.client.initialize();
    }
}

module.exports = new WhatsAppService();
