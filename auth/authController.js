const { comparePassword } = require('../utils/bcrypt');
const AdminModel = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const AuthController = {

    loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;


            const admin = await AdminModel.getByEmail(email);
            if (!admin) {
                return res.status(404).json({success: false, message: 'Invalid email or password'});
            }


            const isMatch = await comparePassword(password, admin.password);
            if (!isMatch) {
                return res.statusW(401).json({ success: false, message: 'Invalid email or password'});
            }

            const token = jwt.sign(
                { id: admin,ud, email: admin.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN}
            );

            res.json ({ 
                success: true,
                message: "Login successful",
                token: token,
                admin: {
                    id: admin.id,
                    nama: admin.nama,
                    email: admin.email,
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

};

module.exports = AuthController;