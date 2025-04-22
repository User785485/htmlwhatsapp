import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <StorageIcon sx={{ mr: 1 }} />
            HTML File Manager
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex' }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ 
                my: 2, 
                color: 'white',
                backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/upload"
              sx={{ 
                my: 2, 
                color: 'white',
                backgroundColor: location.pathname === '/upload' ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              startIcon={<UploadFileIcon />}
            >
              Upload Files
            </Button>
            <Button
              component={RouterLink}
              to="/search"
              sx={{ 
                my: 2, 
                color: 'white',
                backgroundColor: location.pathname === '/search' ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
