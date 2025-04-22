const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const HtmlFile = require('../models/HtmlFile');
const { extractMediaFromHtml, processHtmlContent } = require('../utils/htmlProcessor');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configure the multer middleware
const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Check if it's an HTML file or a media file
    const filetypes = /html|htm|jpg|jpeg|png|gif|mp4|webm|mp3|wav|ogg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only HTML and media files are allowed!'));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Upload a single HTML file
router.post('/upload', upload.single('htmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Only process HTML files
    if (!req.file.originalname.match(/\.(html|htm)$/)) {
      return res.status(400).json({ message: 'File must be an HTML file' });
    }

    const filePath = req.file.path;
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Process HTML content to extract text and media references
    const { processedHtml, textContent, mediaFiles } = await processHtmlContent(fileContent, filePath);

    // Create a new HTML file record
    const htmlFile = new HtmlFile({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: filePath,
      content: processedHtml,
      textContent: textContent,
      media: mediaFiles,
      size: req.file.size
    });

    await htmlFile.save();
    res.status(201).json({ 
      message: 'File uploaded successfully', 
      file: htmlFile,
      mediaCount: mediaFiles.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
});

// Upload multiple HTML files and associated media
router.post('/upload-bulk', upload.array('files', 100), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of req.files) {
      try {
        // Check if it's an HTML file
        if (file.originalname.match(/\.(html|htm)$/)) {
          const filePath = file.path;
          const fileContent = await fs.readFile(filePath, 'utf8');
          
          // Process HTML content
          const { processedHtml, textContent, mediaFiles } = await processHtmlContent(fileContent, filePath);

          // Create a new HTML file record
          const htmlFile = new HtmlFile({
            fileName: file.filename,
            originalName: file.originalname,
            filePath: filePath,
            content: processedHtml,
            textContent: textContent,
            media: mediaFiles,
            size: file.size
          });

          await htmlFile.save();
          results.push({
            fileName: file.originalname,
            status: 'success',
            id: htmlFile._id,
            mediaCount: mediaFiles.length
          });
        } else {
          // For non-HTML files, they will be handled as associated media
          results.push({
            fileName: file.originalname,
            status: 'skipped',
            message: 'Not an HTML file, will be processed as media if referenced'
          });
        }
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: 'Bulk upload processed',
      results,
      errors,
      totalFiles: req.files.length,
      successCount: results.filter(r => r.status === 'success').length,
      errorCount: errors.length
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Failed to process bulk upload', error: error.message });
  }
});

// Get all HTML files
router.get('/', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Apply sorting
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Get total count for pagination
    const total = await HtmlFile.countDocuments();
    
    // Get files with pagination and sorting, excluding large content field
    const files = await HtmlFile.find({}, { content: 0, textContent: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      files,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
});

// Get a specific HTML file by ID
router.get('/:id', async (req, res) => {
  try {
    const file = await HtmlFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Failed to fetch file', error: error.message });
  }
});

// Update a specific HTML file
router.put('/:id', async (req, res) => {
  try {
    const file = await HtmlFile.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.status(200).json(file);
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Failed to update file', error: error.message });
  }
});

// Delete a specific HTML file
router.delete('/:id', async (req, res) => {
  try {
    const file = await HtmlFile.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete the actual file from the filesystem
    await fs.remove(file.filePath);
    
    // Delete associated media files
    for (const media of file.media) {
      if (media.path && await fs.pathExists(media.path)) {
        await fs.remove(media.path);
      }
    }
    
    // Delete the database record
    await HtmlFile.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'File and associated media deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

module.exports = router;
