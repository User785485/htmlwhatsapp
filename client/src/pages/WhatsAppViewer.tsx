import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Chip, Grid, Divider, Alert, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, IconButton, Card, CardContent,
  Tabs, Tab, AppBar, Toolbar
} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// Types pour les fichiers et médias WhatsApp
interface Media {
  _id?: string;
  type: 'image' | 'video' | 'audio' | 'other';
  path: string;
  originalName: string;
  size?: number;
}

interface WhatsAppFile {
  _id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  content: string;
  textContent?: string;
  media: Media[];
  size?: number;
  createdAt: string;
  updatedAt: string;
}

const WhatsAppViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<WhatsAppFile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Charger le fichier au montage du composant
  useEffect(() => {
    if (id) {
      fetchWhatsAppFile(id);
    }
  }, [id]);
  
  // Récupérer le fichier WhatsApp et ses médias
  const fetchWhatsAppFile = async (fileId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/files/${fileId}`);
      setFile(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Erreur lors du chargement de la conversation:', error);
      setError(error.response?.data?.message || 'Impossible de charger cette conversation');
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer le changement d'onglet
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Formater la taille de fichier
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Inconnue';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };
  
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };
  
  // Obtenir l'icône correspondant au type de média
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon sx={{ color: '#1976d2' }} />;
      case 'video':
        return <VideocamIcon sx={{ color: '#e91e63' }} />;
      case 'audio':
        return <AudiotrackIcon sx={{ color: '#4caf50' }} />;
      default:
        return <InsertDriveFileIcon sx={{ color: '#ff9800' }} />;
    }
  };
  
  // Télécharger un média
  const handleMediaDownload = (media: Media) => {
    // Extraire le nom du fichier du chemin
    const fileName = media.path.split('/').pop() || media.originalName;
    window.open(`/uploads/${fileName}`, '_blank');
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
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#25D366' }} />
      </Box>
    );
  }
  
  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Retour aux conversations
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  // Si aucun fichier n'est trouvé
  if (!file) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Retour aux conversations
        </Button>
        <Alert severity="warning">Conversation introuvable. Elle a peut-être été supprimée.</Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Barre supérieure avec le nom de la conversation */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <AppBar position="static" sx={{ bgcolor: '#128C7E' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <WhatsAppIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" noWrap>
                {getConversationName(file.originalName)}
              </Typography>
            </Box>
          </Toolbar>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
              '& .Mui-selected': { color: 'white' }
            }}
          >
            <Tab label="Conversation" />
            <Tab 
              label={`Médias (${file.media.length})`} 
              icon={<PhotoLibraryIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </AppBar>
      </Paper>

      {/* Contenu des onglets */}
      <Grid container spacing={3}>
        {/* Affichage de la conversation ou des médias selon l'onglet actif */}
        {activeTab === 0 ? (
          // Prévisualisation de la conversation
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 0, 
                maxHeight: 'calc(100vh - 220px)',
                overflow: 'auto',
                bgcolor: '#DCF8C6',
                backgroundImage: `url('data:image/png;base64,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')`,
                backgroundRepeat: 'repeat',
                border: '1px solid #e0e0e0'
              }}
            >
              <div className="html-content-preview" dangerouslySetInnerHTML={{ __html: file.content }} />
            </Paper>
          </Grid>
        ) : (
          // Affichage des médias
          <Grid item xs={12}>
            <Paper sx={{ p: 3, maxHeight: 'calc(100vh - 220px)', overflow: 'auto' }}>
              {file.media.length === 0 ? (
                <Alert severity="info">Aucun média associé à cette conversation.</Alert>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Médias de la conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Tous les fichiers images, vidéos, audios et documents partagés dans cette conversation.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Afficher les images */}
                    {file.media.filter(m => m.type === 'image').length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ImageIcon sx={{ mr: 1, color: '#1976d2' }} />
                          Images
                        </Typography>
                        <Grid container spacing={2}>
                          {file.media
                            .filter(m => m.type === 'image')
                            .map((media, index) => (
                              <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <Box 
                                    sx={{ 
                                      height: 140, 
                                      backgroundImage: `url('/uploads/${media.path.split('/').pop()}')`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center'
                                    }} 
                                  />
                                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, flexGrow: 1 }}>
                                    <Typography variant="body2" noWrap>
                                      {media.originalName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFileSize(media.size)}
                                    </Typography>
                                  </CardContent>
                                  <Box sx={{ p: 1, pt: 0 }}>
                                    <Button 
                                      fullWidth 
                                      size="small" 
                                      variant="outlined" 
                                      startIcon={<DownloadIcon />}
                                      onClick={() => handleMediaDownload(media)}
                                    >
                                      Télécharger
                                    </Button>
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                        </Grid>
                      </Grid>
                    )}
                    
                    {/* Afficher les vidéos */}
                    {file.media.filter(m => m.type === 'video').length > 0 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <VideocamIcon sx={{ mr: 1, color: '#e91e63' }} />
                          Vidéos
                        </Typography>
                        <Grid container spacing={2}>
                          {file.media
                            .filter(m => m.type === 'video')
                            .map((media, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                  <Box p={2}>
                                    <video 
                                      controls 
                                      width="100%" 
                                      src={`/uploads/${media.path.split('/').pop()}`} 
                                      style={{ borderRadius: '4px' }}
                                    />
                                  </Box>
                                  <CardContent sx={{ pt: 0 }}>
                                    <Typography variant="body2">
                                      {media.originalName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFileSize(media.size)}
                                    </Typography>
                                  </CardContent>
                                  <Box sx={{ p: 2, pt: 0 }}>
                                    <Button 
                                      fullWidth 
                                      variant="outlined" 
                                      color="secondary"
                                      startIcon={<DownloadIcon />}
                                      onClick={() => handleMediaDownload(media)}
                                    >
                                      Télécharger la vidéo
                                    </Button>
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                        </Grid>
                      </Grid>
                    )}
                    
                    {/* Afficher les audios */}
                    {file.media.filter(m => m.type === 'audio').length > 0 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AudiotrackIcon sx={{ mr: 1, color: '#4caf50' }} />
                          Messages vocaux et audios
                        </Typography>
                        <List>
                          {file.media
                            .filter(m => m.type === 'audio')
                            .map((media, index) => (
                              <ListItem 
                                key={index}
                                sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: '4px' }}
                              >
                                <ListItemIcon>
                                  <AudiotrackIcon sx={{ color: '#4caf50' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={media.originalName}
                                  secondary={formatFileSize(media.size)}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                  <audio 
                                    controls 
                                    src={`/uploads/${media.path.split('/').pop()}`}
                                    style={{ height: '40px' }}
                                  />
                                </Box>
                                <IconButton 
                                  onClick={() => handleMediaDownload(media)}
                                  color="primary"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </ListItem>
                            ))}
                        </List>
                      </Grid>
                    )}
                    
                    {/* Afficher les autres documents */}
                    {file.media.filter(m => m.type === 'other').length > 0 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <InsertDriveFileIcon sx={{ mr: 1, color: '#ff9800' }} />
                          Documents
                        </Typography>
                        <List>
                          {file.media
                            .filter(m => m.type === 'other')
                            .map((media, index) => (
                              <ListItem 
                                key={index}
                                sx={{ bgcolor: '#fff3e0', mb: 1, borderRadius: '4px' }}
                                secondaryAction={
                                  <Button 
                                    variant="outlined" 
                                    color="warning"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => handleMediaDownload(media)}
                                  >
                                    Télécharger
                                  </Button>
                                }
                              >
                                <ListItemIcon>
                                  <InsertDriveFileIcon sx={{ color: '#ff9800' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={media.originalName}
                                  secondary={formatFileSize(media.size)}
                                />
                              </ListItem>
                            ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Bouton pour télécharger la conversation complète */}
      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => window.open(`/api/files/${file._id}/download`, '_blank')}
          sx={{ bgcolor: '#128C7E', '&:hover': { bgcolor: '#075E54' } }}
        >
          Télécharger la conversation complète
        </Button>
      </Box>
    </Box>
  );
};

export default WhatsAppViewer;
