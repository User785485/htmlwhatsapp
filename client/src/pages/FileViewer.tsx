import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Chip, Grid, Divider, Alert, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, IconButton, Tabs, Tab
} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { HtmlFile, Media } from '../types/types';

const FileViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<HtmlFile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Fetch file data on component mount
  useEffect(() => {
    fetchFile();
  }, [id]);
  
  // Fetch the HTML file details
  const fetchFile = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/files/${id}`);
      setFile(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching file:', error);
      setError(error.response?.data?.message || 'Failed to fetch file. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon color="primary" />;
      case 'video':
        return <VideocamIcon color="secondary" />;
      case 'audio':
        return <AudiotrackIcon color="success" />;
      default:
        return <InsertDriveFileIcon color="info" />;
    }
  };
  
  // Handle media download
  const handleMediaDownload = (media: Media) => {
    window.open(`/uploads/${media.path.split('/').pop()}`, '_blank');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!file) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="warning">File not found. It may have been deleted.</Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {file.originalName}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* File metadata */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              File Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Size</Typography>
              <Typography>{formatFileSize(file.size)}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Created</Typography>
              <Typography>{formatDate(file.createdAt)}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Updated</Typography>
              <Typography>{formatDate(file.updatedAt)}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Media Files</Typography>
              <Typography>{file.media.length} files</Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(`/api/files/${file._id}/download`, '_blank')}
              >
                Download HTML
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* File content and media */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="HTML Preview" />
                <Tab label="Media Files" />
              </Tabs>
            </Box>
            
            {/* HTML Preview */}
            {activeTab === 0 && (
              <Box 
                className="html-content-preview"
                sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}
              >
                <div dangerouslySetInnerHTML={{ __html: file.content }} />
              </Box>
            )}
            
            {/* Media Files */}
            {activeTab === 1 && (
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                {file.media.length === 0 ? (
                  <Alert severity="info">No media files associated with this HTML file.</Alert>
                ) : (
                  <List>
                    {file.media.map((media, index) => (
                      <ListItem 
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleMediaDownload(media)}>
                            <DownloadIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          {getMediaTypeIcon(media.type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={media.originalName} 
                          secondary={`${media.type} - ${formatFileSize(media.size)}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileViewer;
