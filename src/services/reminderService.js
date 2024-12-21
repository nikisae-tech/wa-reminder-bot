const cron = require('node-cron');
const db = require('../database/db');
const config = require('../config/config');
const { formatDateTime } = require('../utils/formatter');

class ReminderService {
    constructor(client) {
        this.client = client;
        this.initializeReminders();
    }

    initializeReminders() {
        // Cron job untuk mengirim pengingat setiap jam
        cron.schedule('0 * * * *', () => {
            const currentHour = new Date().getHours();
            
            // Hanya kirim pengingat antara jam yang ditentukan
            if (currentHour >= config.reminder.startHour && currentHour <= config.reminder.endHour) {
                this.sendReminders();
            }
        });

        // Cron job untuk membersihkan log response yang lebih dari 30 hari
        cron.schedule('0 0 * * *', () => {
            this.cleanupOldResponses();
        });
    }

    async sendReminders() {
        try {
            const activeUsers = await this.getActiveUsers();
            
            for (const user of activeUsers) {
                try {
                    const lastResponse = await this.getLastResponse(user.number);
                    const shouldSendReminder = this.shouldSendReminder(lastResponse);

                    if (shouldSendReminder) {
                        await this.sendReminder(user);
                    }
                } catch (error) {
                    console.error(`Error sending reminder to ${user.number}:`, error);
                }
            }
        } catch (error) {
            console.error('Error in sendReminders:', error);
        }
    }

    getActiveUsers() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM user WHERE status = ?', ['active'], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
    }

    getLastResponse(number) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM response WHERE user_number = ? ORDER BY created_at DESC LIMIT 1',
                [number],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    shouldSendReminder(lastResponse) {
        if (!lastResponse) return true;

        const now = new Date();
        const lastResponseTime = new Date(lastResponse.created_at);
        const timeDiff = now - lastResponseTime;

        // Gunakan interval yang berbeda berdasarkan jenis respons terakhir
        const interval = lastResponse.response_type.startsWith('!') 
            ? config.reminder.fastInterval 
            : config.reminder.interval;

        return timeDiff >= interval;
    }

    async sendReminder(user) {
        const message = `Halo ${user.name},\n\nBagaimana kabar Anda hari ini?\n\nPesan ini dikirim secara otomatis pada: ${formatDateTime(new Date())}`;

        try {
            const chat = await this.client.getChatById(`${user.number}@c.us`);
            await chat.sendMessage(message);
            console.log(`Reminder sent to ${user.number} at ${new Date()}`);
        } catch (error) {
            console.error(`Failed to send reminder to ${user.number}:`, error);
        }
    }

    cleanupOldResponses() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        db.run(
            'DELETE FROM response WHERE created_at < ?',
            [thirtyDaysAgo.toISOString()],
            (err) => {
                if (err) {
                    console.error('Error cleaning up old responses:', err);
                } else {
                    console.log('Old responses cleaned up successfully');
                }
            }
        );
    }
}

module.exports = ReminderService;
