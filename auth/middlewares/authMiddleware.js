const jwt = require('jsonwebtoken');

// Membaca token dari cookie httpOnly (utama) atau header Authorization (fallback,
// misal untuk klien non-browser seperti mobile app / Postman)
const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return null;
};

const authenticate = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak, silakan login terlebih dahulu' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // berisi { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Sesi tidak valid atau sudah kedaluwarsa' });
  }
};

// Contoh pemakaian: router.get('/admin/dashboard', authenticate, authorize('admin'), handler)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke resource ini' });
    }
    next();
  };
};

const authorizeSelfOrAdmin = (paramName = 'id_user') => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Akses ditolak, silakan login terlebih dahulu' });
  }
  if (req.user.role === 'admin') return next();

  // Number() penting: req.params berupa string, sedangkan id di token berupa angka
  if (req.user.role === 'user' && Number(req.params[paramName]) === Number(req.user.id)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke resource ini' });
};


module.exports = { authenticate, authorize, authorizeSelfOrAdmin };