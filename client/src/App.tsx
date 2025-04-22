import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import Header from './components/Header';
import WhatsAppDashboard from './pages/WhatsAppDashboard';
import WhatsAppUpload from './pages/WhatsAppUpload';
import WhatsAppViewer from './pages/WhatsAppViewer';
import WhatsAppSearch from './pages/WhatsAppSearch';

function App() {
  return (
    <div className="App">
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#25D366' }}>
            Gestionnaire de sauvegardes WhatsApp
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Importez, recherchez et visualisez vos conversations WhatsApp sauvegardées en HTML
          </Typography>
        </Box>
        <Routes>
          <Route path="/" element={<WhatsAppDashboard />} />
          <Route path="/upload" element={<WhatsAppUpload />} />
          <Route path="/view/:id" element={<WhatsAppViewer />} />
          <Route path="/search" element={<WhatsAppSearch />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
