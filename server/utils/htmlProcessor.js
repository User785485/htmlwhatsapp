const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs-extra');

/**
 * Extract and process media references from HTML content
 * @param {string} htmlContent - Raw HTML content
 * @param {string} htmlFilePath - Path to the HTML file
 * @returns {Object} - Processed HTML, extracted text, and media files
 */
async function processHtmlContent(htmlContent, htmlFilePath) {
  // Load HTML content into cheerio
  const $ = cheerio.load(htmlContent);
  
  // Extract text content for search indexing
  const textContent = $('body').text().trim();
  
  // Get the directory containing the HTML file
  const baseDir = path.dirname(htmlFilePath);
  
  // Get the uploads directory
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  // Track media files
  const mediaFiles = [];
  
  // Process images
  $('img').each(function() {
    const imgSrc = $(this).attr('src');
    if (imgSrc && !imgSrc.startsWith('http')) {
      const mediaInfo = processMediaReference(imgSrc, 'image', baseDir, uploadsDir);
      if (mediaInfo) {
        // Update the img src to point to the new location
        $(this).attr('src', '/uploads/' + path.basename(mediaInfo.path));
        mediaFiles.push(mediaInfo);
      }
    }
  });
  
  // Process videos
  $('video source').each(function() {
    const videoSrc = $(this).attr('src');
    if (videoSrc && !videoSrc.startsWith('http')) {
      const mediaInfo = processMediaReference(videoSrc, 'video', baseDir, uploadsDir);
      if (mediaInfo) {
        $(this).attr('src', '/uploads/' + path.basename(mediaInfo.path));
        mediaFiles.push(mediaInfo);
      }
    }
  });
  
  // Process audio
  $('audio source').each(function() {
    const audioSrc = $(this).attr('src');
    if (audioSrc && !audioSrc.startsWith('http')) {
      const mediaInfo = processMediaReference(audioSrc, 'audio', baseDir, uploadsDir);
      if (mediaInfo) {
        $(this).attr('src', '/uploads/' + path.basename(mediaInfo.path));
        mediaFiles.push(mediaInfo);
      }
    }
  });
  
  // Process links to media files
  $('a').each(function() {
    const href = $(this).attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      const extension = path.extname(href).toLowerCase();
      
      let mediaType = 'other';
      if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(extension)) {
        mediaType = 'image';
      } else if (/\.(mp4|webm|avi|mov)$/i.test(extension)) {
        mediaType = 'video';
      } else if (/\.(mp3|wav|ogg|aac)$/i.test(extension)) {
        mediaType = 'audio';
      } else if (/\.(html|htm)$/i.test(extension)) {
        // Skip HTML files
        return;
      }
      
      const mediaInfo = processMediaReference(href, mediaType, baseDir, uploadsDir);
      if (mediaInfo) {
        $(this).attr('href', '/uploads/' + path.basename(mediaInfo.path));
        mediaFiles.push(mediaInfo);
      }
    }
  });
  
  // Get the processed HTML content
  const processedHtml = $.html();
  
  return {
    processedHtml,
    textContent,
    mediaFiles
  };
}

/**
 * Process a media reference - copy to uploads if needed
 * @param {string} reference - Media reference path
 * @param {string} type - Media type (image, video, audio, other)
 * @param {string} baseDir - Base directory of HTML file
 * @param {string} uploadsDir - Target uploads directory
 * @returns {Object|null} - Media file information or null if invalid
 */
function processMediaReference(reference, type, baseDir, uploadsDir) {
  try {
    // Handle relative paths
    const sourcePath = path.isAbsolute(reference) 
      ? reference 
      : path.resolve(baseDir, reference);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Media file not found: ${sourcePath}`);
      return null;
    }
    
    // Create unique filename for target
    const originalName = path.basename(sourcePath);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(originalName)}`;
    const targetPath = path.join(uploadsDir, uniqueName);
    
    // Copy file to uploads directory
    fs.copySync(sourcePath, targetPath);
    
    // Get file stats
    const stats = fs.statSync(targetPath);
    
    return {
      type,
      path: targetPath,
      originalName,
      size: stats.size
    };
  } catch (error) {
    console.error(`Error processing media reference: ${reference}`, error);
    return null;
  }
}

/**
 * Extract media references from HTML content
 * @param {string} htmlContent - Raw HTML content
 * @returns {Array} - Array of media references
 */
function extractMediaFromHtml(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const mediaRefs = new Set();
  
  // Extract image sources
  $('img').each(function() {
    const src = $(this).attr('src');
    if (src && !src.startsWith('http')) {
      mediaRefs.add(src);
    }
  });
  
  // Extract video sources
  $('video source').each(function() {
    const src = $(this).attr('src');
    if (src && !src.startsWith('http')) {
      mediaRefs.add(src);
    }
  });
  
  // Extract audio sources
  $('audio source').each(function() {
    const src = $(this).attr('src');
    if (src && !src.startsWith('http')) {
      mediaRefs.add(src);
    }
  });
  
  // Extract links to potential media files
  $('a').each(function() {
    const href = $(this).attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      const extension = path.extname(href).toLowerCase();
      if (/\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|avi|mov|mp3|wav|ogg|aac)$/i.test(extension)) {
        mediaRefs.add(href);
      }
    }
  });
  
  return Array.from(mediaRefs);
}

module.exports = {
  processHtmlContent,
  extractMediaFromHtml
};
