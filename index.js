const express = require("express");
const cors = require("cors");
const path = require("path");

require('dotenv').config();

const authRoutes = require('./auth/authRoute');

const adminRoutes = require('./routes/adminRoute');

const kamarRoutes = require('./routes/kamar/kamarRoute');
const tipeKamarRoutes = require('./routes/kamar/tipeKamarRoute');
const fasilitasKamarRoutes = require('./routes/kamar/fasilitasKamarRoute');

const customerRoutes = require('./routes/customerRoute');

const fotoRoutes = require('./routes/kamar/fotoKamarRoute');

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173"],    
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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


//Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/data", (req, res) => {
    res.json({ message: "hello from the API!"});
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})