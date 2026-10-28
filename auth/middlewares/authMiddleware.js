const jwt = require('jsonwebtoken');
const UserModel = require('../../models/userModel');
const AdminModel = require('../../models/adminModel');

// Membaca token dari cookie httpOnly (utama) atau header Authorization (fallback,
// misal untuk klien non-browser seperti mobile app / Postman)
const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return null;
};

// Memeriksa token DAN status akun di database pada setiap request, supaya
// user yang di-blacklist / dinonaktifkan dan token lama (setelah ganti password)
// langsung kehilangan akses, tidak menunggu token kedaluwarsa.
// Mengembalikan { user } jika sesi sah, atau { reason } jika tidak.
const resolveSession = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return { reason: 'Sesi tidak valid atau sudah kedaluwarsa' };
  }

  // Tabel admin dan user punya id sendiri-sendiri (bisa sama), jadi dibedakan lewat role
  let state;
  let isActive;
  if (decoded.role === 'user') {
    state = await UserModel.getAuthState(decoded.id);
    isActive = state && state.is_active !== 0 && !state.is_blacklist;
  } else if (decoded.role === 'admin') {
    state = await AdminModel.getAuthState(decoded.id);
    isActive = state && Number(state.status) === 1;
  } else {
    return { reason: 'Sesi tidak valid atau sudah kedaluwarsa' };
  }

  if (!state) return { reason: 'Akun tidak ditemukan' };
  if (!isActive) return { reason: 'Akun Anda tidak aktif atau diblokir' };
  // Token lama (sebelum ganti password) atau token tanpa 'tv' ditolak
  if (Number(decoded.tv) !== Number(state.token_version)) {
    return { reason: 'Sesi sudah berakhir, silakan login kembali' };
  }

  return { user: decoded }; // berisi { id, email, role, tv }
};

const authenticate = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak, silakan login terlebih dahulu' });
  }

  try {
    const session = await resolveSession(token);
    if (!session.user) {
      res.clearCookie('token'); // sesi sudah tidak sah: bersihkan cookie-nya
      return res.status(401).json({ success: false, message: session.reason });
    }
    req.user = session.user;
    next();
  } catch (error) {
    next(error); // error database: diteruskan ke penangan error global (500)
  }
};

// Seperti authenticate, tetapi TIDAK menolak request tanpa sesi sah.
// Dipakai untuk route publik yang isinya berbeda bagi admin (mis. GET /kamar).
const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const session = await resolveSession(token);
      if (session.user) req.user = session.user;
    } catch (error) {
      // gangguan database: perlakukan sebagai pengunjung biasa
    }
  }
  next();
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

// Admin boleh mengakses semua; user hanya boleh jika id di URL sama dengan id di token.
const authorizeSelfOrAdmin = (paramName = 'id_user') => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Akses ditolak, silakan login terlebih dahulu' });
  }
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'user' && Number(req.params[paramName]) === Number(req.user.id)) return next();
  return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke resource ini' });
};

module.exports = { authenticate, optionalAuth, authorize, authorizeSelfOrAdmin };