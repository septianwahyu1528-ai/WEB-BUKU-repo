import express from 'express';
import supabase from '../supabase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer setup untuk temporary upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format gambar tidak didukung'));
        }
    }
});

// ===== SUPABASE FILE UPLOAD ENDPOINTS =====

// 1. Upload image to Supabase Storage
router.post('/supabase/upload-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const bucket = 'book-covers'; // Ganti dengan nama bucket Anda
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(req.file.originalname)}`;
        
        // Upload ke Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                cacheControl: '3600'
            });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get public URL
        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                fileName: fileName,
                url: publicData.publicUrl,
                path: data.path
            }
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Delete image from Supabase Storage
router.delete('/supabase/delete-image', async (req, res) => {
    try {
        const { fileName, bucket = 'book-covers' } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: 'fileName required' });
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get image URL from Supabase Storage
router.get('/supabase/image-url', async (req, res) => {
    try {
        const { fileName, bucket = 'book-covers' } = req.query;

        if (!fileName) {
            return res.status(400).json({ error: 'fileName required' });
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        res.json({
            success: true,
            data: {
                url: data.publicUrl
            }
        });
    } catch (error) {
        console.error('Get image URL error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. List images in bucket
router.get('/supabase/images-list', async (req, res) => {
    try {
        const { bucket = 'book-covers', limit = 100, offset = 0 } = req.query;

        const { data, error } = await supabase.storage
            .from(bucket)
            .list('', {
                limit: parseInt(limit),
                offset: parseInt(offset),
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get public URLs for all files
        const filesWithUrls = data.map(file => {
            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(file.name);
            
            return {
                ...file,
                url: publicData.publicUrl
            };
        });

        res.json({
            success: true,
            data: filesWithUrls
        });
    } catch (error) {
        console.error('List images error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Upload book cover with Supabase Storage
router.post('/supabase/books/:id/upload-cover', upload.single('cover'), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const bucket = 'book-covers';
        const fileName = `books/${id}-${Date.now()}${path.extname(req.file.originalname)}`;

        // Upload ke Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get public URL
        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        // Update book with new cover URL
        const { data: bookData, error: updateError } = await supabase
            .from('books')
            .update({ 
                cover_url: publicData.publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        res.json({
            success: true,
            message: 'Book cover uploaded successfully',
            data: {
                url: publicData.publicUrl,
                book: bookData[0]
            }
        });
    } catch (error) {
        console.error('Upload book cover error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Export data as CSV
router.get('/supabase/export/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['books', 'customers', 'orders', 'order_items'];

        if (!validTables.includes(table)) {
            return res.status(400).json({ error: 'Invalid table name' });
        }

        const { data, error } = await supabase
            .from(table)
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Convert to CSV
        if (data.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${table}-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
