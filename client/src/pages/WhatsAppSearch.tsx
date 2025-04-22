import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, IconButton, InputAdornment, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, ListItemAvatar, Avatar, Divider,
  Button, Chip, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

// Type local pour un fichier WhatsApp
interface WhatsAppFile {
  _id: string;
  fileName: string;
  originalName: string;
  content: string;
  textContent?: string;
  media: { type: string; originalName: string; }[];
  size?: number;
  createdAt: string;
  updatedAt: string;
}

const WhatsAppSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mediaFilter, setMediaFilter] = useState<string>('');
  const [results, setResults] = useState<WhatsAppFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  
  // Effectuer la recherche lorsque l'utilisateur soumet le formulaire
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      // Construire les paramètres de recherche
      let queryParams = `search=${encodeURIComponent(searchTerm)}&sortField=relevance`;
      
      if (mediaFilter) {
        queryParams += `&mediaType=${mediaFilter}`;
      }
      
      const response = await axios.get(`/api/search?${queryParams}`);
      
      // Filtrer pour ne garder que les fichiers qui semblent être des sauvegardes WhatsApp
      const whatsappResults = response.data.files.filter((file: any) => {
        return file.originalName.includes('WhatsApp') || 
               file.originalName.includes('chat') || 
               file.content?.includes('WhatsApp');
      });
      
      setResults(whatsappResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Extraire le nom de la conversation à partir du nom de fichier
  const getConversationName = (fileName: string) => {
    // Enlever les extensions et les préfixes courants
    const cleanName = fileName
      .replace(/\.html$|\.htm$/i, '')
      .replace(/WhatsApp Chat - /i, '')
      .replace(/WhatsApp Chat with /i, '');
    
    return cleanName;
  };
  
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  // Formatter les extraits de texte avec mise en évidence des termes recherchés
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm || !text) return text;
    
    // Échapper les caractères spéciaux pour éviter les erreurs dans la regex
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} style={{ backgroundColor: '#25D366', color: 'white' }}>{part}</mark> : part
    );
  };
  
  // Extraire un extrait de texte autour des occurrences du terme recherché
  const getSearchContextSnippet = (text?: string): string => {
    if (!text || !searchTerm) return '';
    
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(.{0,50}${escapedSearchTerm}.{0,50})`, 'gi');
    const matches = text.match(regex);
    
    if (!matches || matches.length === 0) return text.substring(0, 100) + '...';
    
    return matches[0] + '...';
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />
        Rechercher dans vos conversations
      </Typography>
      
      {/* Formulaire de recherche */}
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Rechercher dans les conversations"
              placeholder="Nom de contact, message, mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={24} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrer par type de média</InputLabel>
              <Select
                value={mediaFilter}
                label="Filtrer par type de média"
                onChange={(e) => setMediaFilter(e.target.value)}
              >
                <MenuItem value="">Tous les types</MenuItem>
                <MenuItem value="image">Images</MenuItem>
                <MenuItem value="video">Vidéos</MenuItem>
                <MenuItem value="audio">Messages vocaux</MenuItem>
                <MenuItem value="other">Documents</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!searchTerm.trim() || loading}
              startIcon={<SearchIcon />}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
            >
              Rechercher
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Résultats de recherche */}
      {searched && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress sx={{ color: '#25D366' }} />
            </Box>
          ) : results.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Aucun résultat trouvé</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Essayez d'autres termes de recherche ou vérifiez l'orthographe
              </Typography>
            </Paper>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {results.length} conversation{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''}
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                {results.map((file, index) => (
                  <React.Fragment key={file._id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.04)' },
                        p: 2
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#25D366' }}>
                          <WhatsAppIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {getConversationName(file.originalName)}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {highlightSearchTerm(getSearchContextSnippet(file.textContent))}
                            </Typography>
                            
                            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                              {file.media.some(m => m.type === 'image') && (
                                <Chip 
                                  size="small" 
                                  icon={<ImageIcon fontSize="small" />} 
                                  label="Images" 
                                  variant="outlined" 
                                />
                              )}
                              {file.media.some(m => m.type === 'video') && (
                                <Chip 
                                  size="small" 
                                  icon={<VideocamIcon fontSize="small" />} 
                                  label="Vidéos" 
                                  variant="outlined" 
                                />
                              )}
                              {file.media.some(m => m.type === 'audio') && (
                                <Chip 
                                  size="small" 
                                  icon={<AudiotrackIcon fontSize="small" />} 
                                  label="Audio" 
                                  variant="outlined" 
                                />
                              )}
                              {file.media.some(m => m.type === 'other') && (
                                <Chip 
                                  size="small" 
                                  icon={<InsertDriveFileIcon fontSize="small" />} 
                                  label="Documents" 
                                  variant="outlined" 
                                />
                              )}
                              <Chip 
                                size="small" 
                                label={`Importé le ${formatDate(file.createdAt)}`} 
                                variant="outlined" 
                              />
                            </Box>
                          </>
                        }
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={RouterLink}
                          to={`/view/${file._id}`}
                          startIcon={<VisibilityIcon />}
                          sx={{ 
                            borderColor: '#25D366', 
                            color: '#25D366',
                            '&:hover': { borderColor: '#128C7E', bgcolor: 'rgba(37, 211, 102, 0.04)' } 
                          }}
                        >
                          Voir
                        </Button>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WhatsAppSearch;
