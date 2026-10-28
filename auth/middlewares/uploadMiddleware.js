const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Folder absolut (tidak bergantung pada dari mana server dijalankan): server/uploads
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// Whitelist: mimetype -> ekstensi yang kita tentukan sendiri (bukan dari nama file user)
const ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

// Mimetype dari browser bisa dipalsukan, jadi isi file dicek lagi lewat byte pertamanya.
const SIGNATURES = {
    'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/webp': (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
};

class UploadError extends Error {}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    // Nama acak + ekstensi dari whitelist: tidak bisa ditebak, tidak bisa bentrok,
    // dan nama asli (yang bisa berisi path atau karakter aneh) tidak dipakai sama sekali.
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED_TYPES[file.mimetype]),
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES[file.mimetype]) {
            return cb(new UploadError('Format file harus JPG, PNG, atau WEBP'));
        }
        cb(null, true);
    },
});

const removeFile = async (filePath) => {
    if (!filePath) return;
    try {
        await fs.promises.unlink(filePath);
    } catch {
        // file sudah tidak ada: abaikan
    }
};

const hasValidSignature = async (file) => {
    const handle = await fs.promises.open(file.path, 'r');
    try {
        const buffer = Buffer.alloc(12);
        await handle.read(buffer, 0, 12, 0);
        return SIGNATURES[file.mimetype](buffer);
    } finally {
        await handle.close();
    }
};

// Pemakaian di route: uploadImage('image')
// Error upload dijawab JSON 400 (bukan halaman HTML error bawaan Express).
const uploadImage = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
        if (err) {
            let message = null;
            if (err.code === 'LIMIT_FILE_SIZE') message = 'Ukuran file maksimal 2 MB';
            else if (err instanceof UploadError) message = err.message;
            else if (err instanceof multer.MulterError) message = 'Upload tidak valid';

            if (!message) return next(err);
            return res.status(400).json({ success: false, message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File gambar wajib diunggah' });
        }

        try {
            if (!(await hasValidSignature(req.file))) {
                await removeFile(req.file.path);
                return res.status(400).json({ success: false, message: 'Isi file bukan gambar yang valid' });
            }
            next();
        } catch (error) {
            await removeFile(req.file.path);
            next(error);
        }
    });
};

module.exports = { uploadImage, removeFile, UPLOAD_DIR };