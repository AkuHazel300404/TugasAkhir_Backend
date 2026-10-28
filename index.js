const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

require('dotenv').config();

const {AppError} = require('./utils/httpError');

const authRoutes = require('./auth/routes/authRoute');

const adminRoutes = require('./routes/adminRoute');

const kamarRoutes = require('./routes/kamar/kamarRoute');
const tipeKamarRoutes = require('./routes/kamar/tipeKamarRoute');
const fasilitasKamarRoutes = require('./routes/kamar/fasilitasKamarRoute');

const customerRoutes = require('./routes/customerRoute');
const userRoutes = require('./routes/userRoutes');

const fotoRoutes = require('./routes/kamar/fotoKamarRoute');

const reservasiRoutes = require('./routes/reservasi/reservasiRoute');

const app = express();


app.disable('x-powered-by'); // Disable the 'X-Powered-By' header for security reasons

app.use(
    cors({
        origin: ["http://localhost:5173"],    
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    index: false,
    setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
    },
}));

//Admin Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

//Kamar Routes
app.use('/api', kamarRoutes);
app.use('/api', tipeKamarRoutes);
app.use('/api', fasilitasKamarRoutes);

app.use('/api', fotoRoutes);

//Customer Routes
app.use('/api', customerRoutes);
app.use('/api', userRoutes);
//Reservasi Routes
app.use('/api', reservasiRoutes);

//Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/data", (req, res) => {
    res.json({ message: "hello from the API!"});
});

app.use((req, res) => {
    res.status(404).json({success: false, message: 'Endpoint tidak ditemukan'});
});

app.use((err, req, res, next) => {
    if(res.headersSent) return next(err);
    
    if(err.type === 'entity.parse.failed') {
        return res.status(400).json({success:false, message: 'Format JSON tidak valid'});
    }
    if(err.type === 'entity.too.large') {
        return res.status(413).json({success: false, message: 'Data yang dikirm terlalu besar'});
    }
    if(err instanceof AppError) {
        return res.status(err.status).json({success: false, message: err.message});
    }

    console.error('Unhandled error:', err);
    return res.status(500).json({success: false, message: 'Terjadi kesalahan pada server'});
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});