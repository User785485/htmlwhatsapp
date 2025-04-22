import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, LinearProgress, Alert, Grid, List,
  ListItem, ListItemIcon, ListItemText, IconButton
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  
  const navigate = useNavigate();

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-HTML and non-media files
    const validFiles = acceptedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension === 'html' || extension === 'htm' || 
             ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav', 'ogg'].includes(extension || '');
    });
    
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setUploadError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    }
  });

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async () => {
    if (files.length === 0) {
      setUploadError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);
    setResults(null);

    try {
      const formData = new FormData();
      
      // Add all files to formData
      files.forEach(file => {
        formData.append('files', file);
      });

      // Use axios to track upload progress
      const response = await axios.post('/api/files/upload-bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });

      setResults(response.data);
      setUploadSuccess(true);
      setFiles([]);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload HTML Files
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Upload HTML files and their associated media files (images, videos, audio). 
          The system will automatically process the HTML files and extract references to media files.
        </Typography>

        {/* Dropzone */}
        <Box 
          {...getRootProps()} 
          className="dropzone" 
          sx={{
            mt: 2,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            borderColor: isDragActive ? 'primary.main' : 'grey.300'
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
          {isDragActive ? (
            <Typography>Drop the files here ...</Typography>
          ) : (
            <Typography>Drag and drop files here, or click to select files</Typography>
          )}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Accepted files: HTML, images, videos, audio
          </Typography>
        </Box>

        {/* File list */}
        {files.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem 
                  key={`${file.name}-${index}`}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name} 
                    secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Upload progress */}
        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Uploading {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Error message */}
        {uploadError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {uploadError}
          </Alert>
        )}

        {/* Success message */}
        {uploadSuccess && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Files uploaded successfully!
          </Alert>
        )}

        {/* Upload results */}
        {results && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'white' }}>
                  <Typography variant="h5">{results.successCount}</Typography>
                  <Typography variant="body2">Files Processed Successfully</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, backgroundColor: results.errorCount > 0 ? 'error.light' : 'grey.300', color: 'white' }}>
                  <Typography variant="h5">{results.errorCount}</Typography>
                  <Typography variant="body2">Errors</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'white' }}>
                  <Typography variant="h5">{results.totalFiles}</Typography>
                  <Typography variant="body2">Total Files</Typography>
                </Paper>
              </Grid>
            </Grid>

            {results.results && results.results.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Processed Files:</Typography>
                <List>
                  {results.results.map((result: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {result.status === 'success' ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={result.fileName} 
                        secondary={result.status === 'success' 
                          ? `Successfully processed with ${result.mediaCount || 0} media files` 
                          : result.message || 'Skipped'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {results.errors && results.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" color="error" gutterBottom>Errors:</Typography>
                <List>
                  {results.errors.map((error: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={error.fileName} 
                        secondary={error.error} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        {/* Action buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            startIcon={<CloudUploadIcon />}
          >
            Upload {files.length > 0 ? `(${files.length} files)` : ''}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FileUpload;
