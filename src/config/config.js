require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    timezone: process.env.TZ || 'Asia/Jakarta',
    reminder: {
        interval: 2 * 60 * 60 * 1000,  // 2 jam
        fastInterval: 60 * 1000,        // 1 menit
        startHour: 7,                   // Jam mulai
        endHour: 21                     // Jam selesai
    }
};
