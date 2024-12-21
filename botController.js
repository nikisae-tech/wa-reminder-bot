const db = require('../database/db');
const ReminderService = require('../services/reminderService');
const { formatDateTime } = require('../utils/formatter');

class BotController {
    constructor(client) {
        this.client = client;
        this.reminderService = new ReminderService(client);
    }

    async handleMessage(message) {
        try {
            const chat = await message.getChat();
            const sender = await message.getContact();
            const messageText = message.body.toLowerCase();

            // Cek apakah pengirim adalah admin
            const isAdmin = await this.checkIsAdmin(sender.id.user);

            // Handle commands
            if (messageText.startsWith('!')) {
                const [command, ...args] = messageText.slice(1).split(' ');

                switch (command) {
                    case 'help':
                        await this.sendHelpMessage(chat);
                        break;

                    case 'register':
                        if (isAdmin) {
                            await this.registerUser(chat, args, sender);
                        }
                        break;

                    case 'unregister':
                        if (isAdmin) {
                            await this.unregisterUser(chat, args);
                        }
                        break;

                    case 'list':
                        if (isAdmin) {
                            await this.listUsers(chat);
                        }
                        break;

                    case 'status':
                        await this.checkStatus(chat, sender);
                        break;

                    default:
                        await chat.sendMessage('Perintah tidak dikenal. Ketik !help untuk bantuan.');
                }
            }

            // Log response
            this.logResponse(sender.id.user, messageText);

        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    async checkIsAdmin(number) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM admin WHERE number = ?', [number], (err, row) => {
                if (err) reject(err);
                resolve(!!row);
            });
        });
    }

    async sendHelpMessage(chat) {
        const helpMessage = `*Daftar Perintah*\n
!help - Menampilkan bantuan
!status - Cek status pengguna
!register [nomor] [nama] - Mendaftarkan pengguna baru (Admin only)
!unregister [nomor] - Menghapus pengguna (Admin only)
!list - Menampilkan daftar pengguna (Admin only)`;

        await chat.sendMessage(helpMessage);
    }

    async registerUser(chat, args, sender) {
        if (args.length < 2) {
            await chat.sendMessage('Format: !register [nomor] [nama]');
            return;
        }

        const number = args[0];
        const name = args.slice(1).join(' ');

        db.run('INSERT INTO user (number, name) VALUES (?, ?)', [number, name], async (err) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    await chat.sendMessage('Nomor tersebut sudah terdaftar.');
                } else {
                    console.error('Database error:', err);
                    await chat.sendMessage('Terjadi kesalahan saat mendaftarkan pengguna.');
                }
                return;
            }
            await chat.sendMessage(`Berhasil mendaftarkan ${name} (${number})`);
        });
    }

    async unregisterUser(chat, args) {
        if (args.length < 1) {
            await chat.sendMessage('Format: !unregister [nomor]');
            return;
        }

        const number = args[0];

        db.run('UPDATE user SET status = ? WHERE number = ?', ['inactive', number], async (err) => {
            if (err) {
                console.error('Database error:', err);
                await chat.sendMessage('Terjadi kesalahan saat menghapus pengguna.');
                return;
            }
            await chat.sendMessage(`Berhasil menghapus pengguna ${number}`);
        });
    }

    async listUsers(chat) {
        db.all('SELECT * FROM user WHERE status = ?', ['active'], async (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                await chat.sendMessage('Terjadi kesalahan saat mengambil daftar pengguna.');
                return;
            }

            if (rows.length === 0) {
                await chat.sendMessage('Belum ada pengguna yang terdaftar.');
                return;
            }

            const userList = rows.map((user, index) => 
                `${index + 1}. ${user.name} (${user.number})\n   Terdaftar: ${formatDateTime(user.created_at)}`
            ).join('\n\n');

            await chat.sendMessage(`*Daftar Pengguna*\n\n${userList}`);
        });
    }

    async checkStatus(chat, sender) {
        db.get('SELECT * FROM user WHERE number = ?', [sender.id.user], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                await chat.sendMessage('Terjadi kesalahan saat mengecek status.');
                return;
            }

            if (!user) {
                await chat.sendMessage('Nomor Anda belum terdaftar.');
                return;
            }

            const status = user.status === 'active' ? 'Aktif' : 'Tidak Aktif';
            await chat.sendMessage(
                `*Status Pengguna*\n\n` +
                `Nama: ${user.name}\n` +
                `Nomor: ${user.number}\n` +
                `Status: ${status}\n` +
                `Terdaftar: ${formatDateTime(user.created_at)}`
            );
        });
    }

    logResponse(number, responseType) {
        db.run('INSERT INTO response (user_number, response_type) VALUES (?, ?)',
            [number, responseType],
            (err) => {
                if (err) {
                    console.error('Error logging response:', err);
                }
            });
    }
}

module.exports = BotController;
