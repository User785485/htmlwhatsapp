import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, useTheme, useMediaQuery } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';

const Header: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" sx={{ bgcolor: '#128C7E' }}>
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
            <WhatsAppIcon sx={{ mr: 1 }} />
            WhatsApp Explorer
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
              startIcon={<HomeIcon />}
            >
              {isMobile ? '' : 'Accueil'}
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
              {isMobile ? '' : 'Importer'}
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
              {isMobile ? '' : 'Rechercher'}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
