import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import FileViewer from './pages/FileViewer';
import Search from './pages/Search';

function App() {
  return (
    <div className="App">
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/view/:id" element={<FileViewer />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
