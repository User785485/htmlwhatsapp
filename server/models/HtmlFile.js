const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'other'],
    required: true
  },
  path: {
    type: String,
    required: true
  },
  originalName: String,
  size: Number
});

const HtmlFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  textContent: String, // Extracted text content for search
  media: [MediaSchema],
  size: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create text index for search functionality
HtmlFileSchema.index({ fileName: 'text', textContent: 'text' });

module.exports = mongoose.model('HtmlFile', HtmlFileSchema);
