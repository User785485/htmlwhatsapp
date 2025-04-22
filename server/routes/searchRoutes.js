const express = require('express');
const router = express.Router();
const HtmlFile = require('../models/HtmlFile');

// Search HTML files based on various criteria
router.get('/', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build search query
    const query = {};
    
    // Text search (file name and content)
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by media type
    if (req.query.mediaType) {
      query['media.type'] = req.query.mediaType;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Sorting
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };
    
    // If it's a text search, include the text score for relevance sorting
    if (req.query.search && req.query.sortField === 'relevance') {
      sort.score = { $meta: 'textScore' };
    }
    
    // Execute search with pagination, excluding large content fields
    const total = await HtmlFile.countDocuments(query);
    
    let fileQuery = HtmlFile.find(query, { content: 0 });
    
    // Add text score projection for text searches
    if (req.query.search) {
      fileQuery = fileQuery.select({ score: { $meta: 'textScore' } });
    }
    
    const files = await fileQuery
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
    console.error('Search error:', error);
    res.status(500).json({ message: 'Failed to search files', error: error.message });
  }
});

// Get search suggestions (autocomplete)
router.get('/suggestions', async (req, res) => {
  try {
    if (!req.query.term || req.query.term.length < 2) {
      return res.status(200).json({ suggestions: [] });
    }
    
    // Search for file names containing the search term
    const files = await HtmlFile.find(
      { fileName: { $regex: req.query.term, $options: 'i' } },
      { fileName: 1, originalName: 1 }
    ).limit(5);
    
    // Extract unique terms from the results
    const suggestions = [...new Set(
      files.map(file => file.originalName.replace(/\.[^/.]+$/, ""))
    )];
    
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Failed to get search suggestions', error: error.message });
  }
});

// Get file statistics
router.get('/stats', async (req, res) => {
  try {
    const totalFiles = await HtmlFile.countDocuments();
    
    // Count files by media type
    const filesByMediaType = await HtmlFile.aggregate([
      { $unwind: "$media" },
      { $group: { _id: "$media.type", count: { $sum: 1 } } }
    ]);
    
    // Get files by date (grouped by month)
    const filesByDate = await HtmlFile.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    res.status(200).json({
      totalFiles,
      filesByMediaType,
      filesByDate
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to get file statistics', error: error.message });
  }
});

module.exports = router;
