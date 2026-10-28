const { hashPassword, comparePassword } = require('../../utils/bcrypt');
const AdminModel = require('../../models/adminModel');
// const UserModel = require('../../models/customerModel');

const UserModel = require('../../models/userModel');

const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m';


const parseTtlToMs = (ttl) => {
    const match = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(String(ttl).trim());
    
    if(!match) return 15 * 60 * 1000;

    const value = Number(match[1]);
    const unit = (match[2] || 'ms').toLowerCase();
    const unitToMs = { ms: 1, s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

    return value * (unitToMs[unit] || 1);
}

const ACCESS_TOKEN_TTL_MS = parseTtlToMs(ACCESS_TOKEN_TTL);

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL
    });
};

const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ACCESS_TOKEN_TTL_MS,
    });
};




const AuthController = {

    //login

    loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email dan Password wajib diisi'});
            }

            const admin = await AdminModel.getByEmail(email);

            if (!admin) {
                return res.status(401).json({success: false, message: 'Invalid email or password'});
            }


            const isMatch = await comparePassword(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password'});
            }

            if(Number(admin.status) !== 1) {
                return res.status(403).json({success: false, message: 'Akun anda tidak aktif.'})
            }

            // const token = jwt.sign(
            //     { id: admin.id, email: admin.email },
            //     process.env.JWT_SECRET,
            //     { expiresIn: process.env.JWT_EXPIRES_IN}
            // );

            const token = generateAccessToken({ id: admin.id, email: admin.email, role: 'admin', tv: admin.token_version });
            setAuthCookie(res, token);

            res.json ({ 
                success: true,
                message: "Login successful",
                admin: {
                    id: admin.id,
                    nama: admin.nama,
                    email: admin.email,
                },
            });
        } catch (error) {
            console.error('loginAdmin error: ', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email dan Password wajib diisi'});
            }

            const user = await UserModel.getByEmail(email);

            if (!user || !user.password) {
                return res.status(401).json({success: false, message: 'Invalid email or password'});
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password'});
            }

            if(user.is_blacklist) {
                return res.status(403).json({success: false, message: 'Akun Anda tidak dapat digunakan.'});
            }

            if(user.is_active === 0) {
                return res.status(403).json({success: false, message: 'Akun kamu tidak aktif.'});
            }

            const token = generateAccessToken({ id: user.id_user, email: user.email, role: 'user', tv: user.token_version });
            setAuthCookie(res, token);

            res.json ({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id_user,
                    nama: user.nama,
                    email: user.email,
                },
            });  
        } catch (error) {
            console.error('loginUser error: ', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    //register

    registerAdmin: async (req, res) => {
        try {
            const { nama, email, password} = req.body;
            
            if(!nama || !email || !password) {
                return res.status(400).json({ success: false, message: 'Nama, Email, dan Password wajib diisi'});
            }

            if(!EMAIL_REGEX.test(email)){
                return res.status(400).json({success: false, message: 'Format email tidak valid'});
            }

            if (password.length < MIN_PASSWORD_LENGTH) {
                return res.status(400).json({success: false, message: `Password harus memiliki minimal ${MIN_PASSWORD_LENGTH} karakter`});
            }

            const existingAdmin = await AdminModel.getByEmail(email);
            if (existingAdmin) {
                return res.status(400).json({success: false, message: 'Email sudah terdaftar'});
            }

            // const hashedPassword = await hashPassword(password);
            const newAdmin = await AdminModel.create({nama, email, password});

            res.status(201).json({
                success: true,
                message: 'Admin berhasil didaftarkan',
                admin: {
                    id: newAdmin.id,
                    nama: newAdmin.nama,
                    email: newAdmin.email,
                },
            });
        } catch (error) {
            console.error('registerAdmin error: ', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    registerUser: async (req, res) => {
        try {
        const { nama, email, password } = req.body;
    
        if (!nama || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
        }
    
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, message: 'Format email tidak valid' });
        }
    
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({
            success: false,
            message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
            });
        }
    
        // Cek duplikat lebih dulu supaya pesan errornya jelas (bukan error 500 dari constraint DB)
        const existingUser = await UserModel.getByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
        }
    
        // const hashedPassword = await hashPassword(password);
        const result = await UserModel.create({ nama: nama.trim(), email, password });
    
        return res.status(201).json({
            success: true,
            message: 'Registrasi berhasil, silakan login',
            user: { id: result.insertId, nama: nama.trim(), email },
        });
        } catch (error) {
        console.error('registerUser error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    changePasswordUser: async (req, res) => {
        try {
            const { password_lama, password_baru } = req.body;

            // bcrypt.compare melempar error kalau inputnya bukan string
            if (typeof password_lama !== 'string' || typeof password_baru !== 'string'
                || !password_lama || !password_baru) {
                return res.status(400).json({ success: false, message: 'Password lama dan password baru wajib diisi' });
            }
            if (password_baru.length < MIN_PASSWORD_LENGTH) {
                return res.status(400).json({ success: false, message: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter` });
            }
            // bcrypt hanya memakai 72 byte pertama; lebih dari itu diabaikan diam-diam
            if (Buffer.byteLength(password_baru, 'utf8') > 72) {
                return res.status(400).json({ success: false, message: 'Password baru terlalu panjang (maksimal 72 karakter)' });
            }
            if (password_lama === password_baru) {
                return res.status(400).json({ success: false, message: 'Password baru tidak boleh sama dengan password lama' });
            }

            // id dari token, BUKAN dari body
            const hash = await UserModel.getPasswordHash(req.user.id);
            if (!hash) {
                return res.status(401).json({ success: false, message: 'Akun tidak ditemukan' });
            }

            const cocok = await comparePassword(password_lama, hash);
            if (!cocok) {
                // 400, bukan 401: frontend sering menganggap 401 sebagai "sesi habis" lalu logout otomatis
                return res.status(400).json({ success: false, message: 'Password lama salah' });
            }

            await UserModel.updatePassword(req.user.id, password_baru);

            const state = await UserModel.getAuthState(req.user.id);
            const token = generateAccessToken({id:req.user.id, email: req.user.email, role: 'user', tv: state.token_version});
            setAuthCookie(res, token);

            return res.json({ success: true, message: 'Password berhasil diubah' });
        } catch (error) {
            console.error('changePasswordUser error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    me: async (req, res) => {
        try {
            const { id, role } = req.user;

            if (role === 'user') {
                const user = await UserModel.getById(id);
                if (!user) return res.status(401).json({ success: false, message: 'Akun tidak ditemukan' });
                return res.json({ success: true, role, user: { ...user, id: user.id_user } });
            }

            const admin = await AdminModel.getById(id);
            if (!admin) return res.status(401).json({ success: false, message: 'Akun tidak ditemukan' });
            return res.json({ success: true, role, user: { id: admin.id, nama: admin.nama, email: admin.email } });
        } catch (error) {
            console.error('me error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        res.json({ success: true, message: 'Logout successful' });
    },

};

module.exports = AuthController;