/**
 * Format tanggal dan waktu ke format yang mudah dibaca
 * @param {Date|string} date - Objek Date atau string tanggal
 * @returns {string} Tanggal dan waktu yang sudah diformat
 */
function formatDateTime(date) {
    const d = new Date(date);
    
    // Daftar nama hari dan bulan dalam Bahasa Indonesia
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Format komponen waktu
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');

    return `${day}, ${date} ${month} ${year} ${hour}:${minute} WIB`;
}

/**
 * Format nomor telepon ke format yang konsisten
 * @param {string} number - Nomor telepon
 * @returns {string} Nomor telepon yang sudah diformat
 */
function formatPhoneNumber(number) {
    // Hapus semua karakter non-digit
    let cleaned = number.replace(/\D/g, '');
    
    // Hapus awalan 0 atau 62
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
    } else if (cleaned.startsWith('62')) {
        cleaned = cleaned.slice(2);
    }
    
    return cleaned;
}

/**
 * Format pesan error ke format yang konsisten
 * @param {Error} error - Object error
 * @returns {string} Pesan error yang sudah diformat
 */
function formatError(error) {
    const timestamp = formatDateTime(new Date());
    return `[ERROR] ${timestamp}\n${error.name}: ${error.message}\n${error.stack || ''}`;
}

module.exports = {
    formatDateTime,
    formatPhoneNumber,
    formatError
};
