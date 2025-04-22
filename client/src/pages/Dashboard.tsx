import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Paper, Grid, Typography, Table, TableHead, TableBody, TableCell, TableContainer, 
  TableRow, Button, TablePagination, IconButton, Chip, Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import axios from 'axios';
import { HtmlFile, PaginationData } from '../types/types';

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<HtmlFile[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  // Fetch file stats
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/search/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch file stats:', error);
    }
  };

  // Fetch files with pagination
  const fetchFiles = async (page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc') => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/files?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`);
      setFiles(response.data.files);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    fetchFiles(newPage + 1, pagination.limit);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    fetchFiles(1, newLimit);
  };

  // Handle file deletion
  const handleDeleteFile = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/files/${id}`);
        // Refresh the file list
        fetchFiles(pagination.page, pagination.limit);
        fetchStats();
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
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

  // Render media type icons
  const renderMediaIcons = (file: HtmlFile) => {
    const mediaTypes = new Set(file.media.map(m => m.type));
    return (
      <Box display="flex" gap={1}>
        {mediaTypes.has('image') && (
          <Tooltip title="Contains images">
            <Chip icon={<ImageIcon fontSize="small" />} label="Images" size="small" variant="outlined" />
          </Tooltip>
        )}
        {mediaTypes.has('video') && (
          <Tooltip title="Contains videos">
            <Chip icon={<VideocamIcon fontSize="small" />} label="Videos" size="small" variant="outlined" />
          </Tooltip>
        )}
        {mediaTypes.has('audio') && (
          <Tooltip title="Contains audio">
            <Chip icon={<AudiotrackIcon fontSize="small" />} label="Audio" size="small" variant="outlined" />
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats summary */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Total Files
              </Typography>
              <Typography component="p" variant="h3">
                {stats.totalFiles}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Media Files
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stats.filesByMediaType?.map((item: any) => (
                  <Chip 
                    key={item._id}
                    label={`${item._id}: ${item.count}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Action
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/upload"
                sx={{ mt: 1 }}
              >
                Upload New Files
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Files table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Media</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading...</TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No files found. <RouterLink to="/upload">Upload some files</RouterLink> to get started.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file._id}>
                    <TableCell>{file.originalName}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{renderMediaIcons(file)}</TableCell>
                    <TableCell>{formatDate(file.createdAt)}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View file">
                          <IconButton 
                            component={RouterLink} 
                            to={`/view/${file._id}`}
                            size="small"
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete file">
                          <IconButton 
                            onClick={() => handleDeleteFile(file._id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Dashboard;
