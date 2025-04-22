import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActionArea, CardMedia,
  TextField, InputAdornment, IconButton, Chip, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Divider, CircularProgress, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

// Type local pour un fichier WhatsApp
interface WhatsAppFile {
  _id: string;
  fileName: string;
  originalName: string;
  createdAt: string;
  media: { type: string; originalName: string; }[];
  size?: number;
}

const WhatsAppDashboard: React.FC = () => {
  const [files, setFiles] = useState<WhatsAppFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<WhatsAppFile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les fichiers au chargement du composant
  useEffect(() => {
    fetchWhatsAppFiles();
  }, []);
  
  // Fonction pour récupérer les fichiers WhatsApp
  const fetchWhatsAppFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/files');
      const whatsappFiles = response.data.files.filter((file: any) => {
        // Filtrer pour ne garder que les fichiers qui semblent être des sauvegardes WhatsApp
        return file.originalName.includes('WhatsApp') || 
               file.originalName.includes('chat') || 
               file.content?.includes('WhatsApp');
      });
      
      setFiles(whatsappFiles);
      setFilteredFiles(whatsappFiles);
      setError(null);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      setError('Impossible de charger vos conversations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrer les fichiers selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file => 
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [searchTerm, files]);
  
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  // Extraire le nom de la conversation à partir du nom de fichier
  const getConversationName = (fileName: string) => {
    // Enlever les extensions et les préfixes courants des noms de fichier WhatsApp
    const cleanName = fileName
      .replace(/\.html$|\.htm$/i, '')
      .replace(/WhatsApp Chat - /i, '')
      .replace(/WhatsApp Chat with /i, '');
    
    return cleanName;
  };
  
  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h1">
          <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />
          Mes conversations WhatsApp
        </Typography>
        
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/upload"
          sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
        >
          Importer des conversations
        </Button>
      </Box>
      
      {/* Barre de recherche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher une conversation..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} edge="end">
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Affichage des conversations */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress sx={{ color: '#25D366' }} />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : filteredFiles.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <InsertDriveFileIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6">Aucune conversation trouvée</Typography>
          <Typography color="textSecondary">
            {searchTerm ? 
              "Aucune conversation ne correspond à votre recherche." : 
              "Commencez par importer vos sauvegardes de conversations WhatsApp."}
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink}
            to="/upload"
            sx={{ mt: 2, bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
          >
            Importer des conversations
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={RouterLink} 
                  to={`/view/${file._id}`}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar sx={{ bgcolor: '#25D366', mr: 1 }}>
                        <WhatsAppIcon />
                      </Avatar>
                      <Typography variant="h6" noWrap>
                        {getConversationName(file.originalName)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Importé le {formatDate(file.createdAt)}
                    </Typography>
                    
                    <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                      {file.media.some(m => m.type === 'image') && (
                        <Chip size="small" label="Images" variant="outlined" />
                      )}
                      {file.media.some(m => m.type === 'video') && (
                        <Chip size="small" label="Vidéos" variant="outlined" />
                      )}
                      {file.media.some(m => m.type === 'audio') && (
                        <Chip size="small" label="Audio" variant="outlined" />
                      )}
                      {file.media.some(m => m.type === 'other') && (
                        <Chip size="small" label="Documents" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default WhatsAppDashboard;
