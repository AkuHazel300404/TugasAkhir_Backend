// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // maksimal 5 percobaan login per IP dalam window di atas
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi dalam beberapa menit' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;