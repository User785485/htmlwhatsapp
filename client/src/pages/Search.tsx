import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Grid, Button, Chip, FormControl, InputLabel,
  Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  TablePagination, IconButton, InputAdornment, Autocomplete, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { HtmlFile, PaginationData } from '../types/types';

const Search: React.FC = () => {
  // Search form state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Search results state
  const [files, setFiles] = useState<HtmlFile[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  
  // Load initial suggestions and most recent files on component mount
  useEffect(() => {
    fetchSuggestions('');
    searchFiles(true);
  }, []);
  
  // Fetch search suggestions
  const fetchSuggestions = async (term: string) => {
    if (term.length < 2 && term.length > 0) return;
    
    try {
      const response = await axios.get(`/api/search/suggestions?term=${encodeURIComponent(term)}`);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };
  
  // Handle search form submission
  const handleSearch = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    searchFiles();
  };
  
  // Reset search form
  const handleReset = () => {
    setSearchTerm('');
    setMediaType('');
    setStartDate('');
    setEndDate('');
    setSortField('createdAt');
    setSortOrder('desc');
    searchFiles(true);
  };
  
  // Search files with current parameters
  const searchFiles = async (isInitial = false) => {
    setLoading(true);
    
    try {
      // Build query parameters
      let queryParams = `page=1&limit=${pagination.limit}`;
      
      if (!isInitial) {
        if (searchTerm) queryParams += `&search=${encodeURIComponent(searchTerm)}`;
        if (mediaType) queryParams += `&mediaType=${mediaType}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;
      }
      
      queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      
      const response = await axios.get(`/api/search?${queryParams}`);
      
      setFiles(response.data.files || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      });
      
      setSearchPerformed(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = async (_event: unknown, newPage: number) => {
    setLoading(true);
    
    try {
      // Build query parameters
      let queryParams = `page=${newPage + 1}&limit=${pagination.limit}`;
      
      if (searchTerm) queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      if (mediaType) queryParams += `&mediaType=${mediaType}`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      
      const response = await axios.get(`/api/search?${queryParams}`);
      
      setFiles(response.data.files || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: newPage + 1,
        limit: 10,
        pages: 0
      });
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    
    setLoading(true);
    
    try {
      // Build query parameters
      let queryParams = `page=1&limit=${newLimit}`;
      
      if (searchTerm) queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      if (mediaType) queryParams += `&mediaType=${mediaType}`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      queryParams += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      
      const response = await axios.get(`/api/search?${queryParams}`);
      
      setFiles(response.data.files || []);
      setPagination({
        ...response.data.pagination,
        limit: newLimit,
        page: 1
      });
    } catch (error) {
      console.error('Rows per page change error:', error);
    } finally {
      setLoading(false);
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
          <Chip icon={<ImageIcon fontSize="small" />} label="Images" size="small" variant="outlined" />
        )}
        {mediaTypes.has('video') && (
          <Chip icon={<VideocamIcon fontSize="small" />} label="Videos" size="small" variant="outlined" />
        )}
        {mediaTypes.has('audio') && (
          <Chip icon={<AudiotrackIcon fontSize="small" />} label="Audio" size="small" variant="outlined" />
        )}
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Search HTML Files
      </Typography>
      
      {/* Search form */}
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search input with autocomplete */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={suggestions}
              inputValue={searchTerm}
              onInputChange={(_event, newValue) => {
                setSearchTerm(newValue);
                fetchSuggestions(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  fullWidth
                  placeholder="Search by file name or content"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
          
          {/* Media type filter */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Select
                value={mediaType}
                label="Media Type"
                onChange={(e) => setMediaType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="image">Images</MenuItem>
                <MenuItem value="video">Videos</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Date range */}
          <Grid item xs={12} md={3}>
            <TextField
              label="From Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="To Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* Sort options */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                label="Sort By"
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="updatedAt">Date Updated</MenuItem>
                <MenuItem value="originalName">File Name</MenuItem>
                <MenuItem value="size">File Size</MenuItem>
                {searchTerm && <MenuItem value="relevance">Relevance</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={sortOrder}
                label="Sort Order"
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Search buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Search
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleReset}
            disabled={loading}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>
      
      {/* Search results */}
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
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Searching...
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchPerformed ? 'No files found matching your search criteria.' : 'Enter search criteria and click Search.'}
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
                      <IconButton 
                        component={RouterLink} 
                        to={`/view/${file._id}`}
                        size="small"
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {files.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pagination.total}
            rowsPerPage={pagination.limit}
            page={pagination.page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Search;
