const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Book, User } = require('../models');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'book_uploads',
        resource_type: 'raw', // For non-image files like PDFs
        format: async (req, file) => {
            const ext = path.extname(file.originalname).substring(1);
            return ext;
        },
        public_id: (req, file) => {
            const filename = path.parse(file.originalname).name;
            return `book-${Date.now()}-${filename}`;
        },
    },
});

const uploadBook = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/books');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 uploads per hour
    message: { message: 'Upload limit reached, please try again later' }
});

// ── GET ALL APPROVED BOOKS ──────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const books = await Book.findAll({
            where: { status: 'approved' },
            include: [{ model: User, as: 'uploader', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});

// ── UPLOAD A BOOK ───────────────────────────────────────────────────
router.post('/upload', auth, uploadLimiter, uploadBook.single('book'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, author, description, category, coverColor } = req.body;

        if (!title || !author) {
            // No need to manually unlink from Cloudinary here easily, but we should validate before upload if possible.
            // For now, simple validation.
            return res.status(400).json({ message: 'Title and Author are required' });
        }

        const book = await Book.create({
            title,
            author,
            description,
            category: category || 'other',
            coverColor: coverColor || '#4a6fa5',
            fileName: req.file.path, // Full Cloudinary URL
            originalName: req.file.originalname,
            fileSize: req.file.size,
            uploaderId: req.user.id,
            status: 'pending' // Admin must approve
        });

        const fullBook = await Book.findByPk(book.id, {
            include: [{ model: User, as: 'uploader', attributes: ['name'] }]
        });

        res.json({ 
            message: 'Book uploaded successfully! It will be visible after admin review.',
            book: fullBook 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// ── DOWNLOAD / VIEW A BOOK ──────────────────────────────────────────
router.get('/:id/download', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book || book.status !== 'approved') {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Increment download count
        await book.increment('downloadCount');

        // Redirect to Cloudinary URL
        res.redirect(book.fileName);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Download failed' });
    }
});

// ── VIEW (INLINE) FOR PDF READING ──────────────────────────────────
router.get('/:id/read', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book || book.status !== 'approved') {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Redirect to Cloudinary URL
        res.redirect(book.fileName);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load book' });
    }
});

module.exports = router;
