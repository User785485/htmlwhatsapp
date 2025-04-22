import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, LinearProgress, Alert, Grid, List,
  ListItem, ListItemIcon, ListItemText, IconButton, Card, CardContent,
  Divider, Stepper, Step, StepLabel
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsAppUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  
  const navigate = useNavigate();

  // Liste des étapes dans le processus d'upload
  const steps = [
    'Sélectionner les fichiers',
    'Téléchargement',
    'Importation terminée'
  ];

  // Handle file drop - accepte les fichiers HTML et médias associés
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Regrouper les fichiers par type
    const htmlFiles = acceptedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')
    );
    
    const mediaFiles = acceptedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav', 'ogg', 'pdf', 'doc', 'docx'].includes(extension);
    });
    
    // Vérifier si on a au moins un fichier HTML de WhatsApp
    const hasWhatsAppHtml = htmlFiles.some(file => 
      file.name.toLowerCase().includes('whatsapp') || 
      file.name.toLowerCase().includes('chat')
    );
    
    if (!hasWhatsAppHtml && htmlFiles.length > 0) {
      // On accepte quand même tous les HTML, car on ne peut pas être sûr du contenu avant de l'examiner
      console.log('Aucun fichier ne semble être une sauvegarde WhatsApp, mais nous allons quand même les traiter.');
    }
    
    setFiles(prevFiles => [...prevFiles, ...htmlFiles, ...mediaFiles]);
    setUploadError(null);
    setActiveStep(files.length === 0 ? 1 : activeStep);
  }, [files, activeStep]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  // Supprimer un fichier de la liste
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Télécharger les fichiers
  const uploadFiles = async () => {
    if (files.length === 0) {
      setUploadError('Veuillez sélectionner au moins un fichier à télécharger');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);
    setResults(null);
    setActiveStep(1);

    try {
      const formData = new FormData();
      
      // Ajouter tous les fichiers à formData
      files.forEach(file => {
        formData.append('files', file);
      });

      // Utiliser axios pour suivre la progression du téléchargement
      const response = await axios.post('/api/files/upload-bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });

      setResults(response.data);
      setUploadSuccess(true);
      setActiveStep(2);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      setUploadError(error.response?.data?.message || 'Échec du téléchargement des fichiers. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  // Retourner au tableau de bord
  const goToDashboard = () => {
    navigate('/');
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />
        Importer des conversations WhatsApp
      </Typography>

      {/* Stepper pour montrer la progression */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {activeStep === 0 && (
          <>
            <Typography variant="body1" gutterBottom>
              Téléchargez vos fichiers de sauvegarde WhatsApp (fichiers HTML) et leurs médias associés.
              Le système identifiera automatiquement les conversations et organisera les médias correspondants.
            </Typography>

            {/* Zone de glisser-déposer */}
            <Box 
              {...getRootProps()} 
              sx={{
                mt: 2,
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: isDragActive ? '#25D366' : 'grey.300',
                bgcolor: 'background.paper',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: '#25D366',
                  bgcolor: 'rgba(37, 211, 102, 0.04)'
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon fontSize="large" sx={{ color: '#25D366', mb: 2 }} />
              {isDragActive ? (
                <Typography>Déposez les fichiers ici...</Typography>
              ) : (
                <Typography>Glissez et déposez vos fichiers ici, ou cliquez pour sélectionner des fichiers</Typography>
              )}
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                Fichiers acceptés: HTML, images, vidéos, audio, PDF, documents
              </Typography>
            </Box>
          </>
        )}

        {/* Liste des fichiers */}
        {files.length > 0 && activeStep < 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fichiers sélectionnés ({files.length})
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {files.map((file, index) => {
                const isWhatsAppFile = file.name.toLowerCase().includes('whatsapp') || 
                                     file.name.toLowerCase().includes('chat');
                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                const isHtmlFile = fileExtension === 'html' || fileExtension === 'htm';
                
                return (
                  <ListItem 
                    key={`${file.name}-${index}`}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: isWhatsAppFile && isHtmlFile ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon>
                      {isWhatsAppFile && isHtmlFile ? 
                        <WhatsAppIcon sx={{ color: '#25D366' }} /> : 
                        <InsertDriveFileIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.name} 
                      secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Progression du téléchargement */}
        {activeStep === 1 && uploading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Téléchargement en cours {uploadProgress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#25D366'
                }
              }} 
            />
          </Box>
        )}

        {/* Message d'erreur */}
        {uploadError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {uploadError}
          </Alert>
        )}

        {/* Résultats du téléchargement */}
        {activeStep === 2 && uploadSuccess && results && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Importation terminée avec succès !</Typography>
              <Typography variant="body2">Vos conversations WhatsApp sont maintenant disponibles dans votre bibliothèque.</Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ color: '#2e7d32' }}>{results.successCount}</Typography>
                    <Typography variant="body2">Fichiers traités avec succès</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: results.errorCount > 0 ? '#ffebee' : '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ color: results.errorCount > 0 ? '#c62828' : '#9e9e9e' }}>{results.errorCount}</Typography>
                    <Typography variant="body2">Erreurs</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ color: '#1565c0' }}>{results.totalFiles}</Typography>
                    <Typography variant="body2">Total des fichiers</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {results.results && results.results.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Fichiers traités :</Typography>
                <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {results.results
                    .filter((result: any) => result.status === 'success')
                    .map((result: any, index: number) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={result.fileName} 
                            secondary={`${result.mediaCount || 0} fichiers média associés`} 
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                </List>
              </Box>
            )}

            {results.errors && results.errors.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" color="error" gutterBottom>Erreurs :</Typography>
                <List sx={{ bgcolor: '#ffebee', borderRadius: 1 }}>
                  {results.errors.map((error: any, index: number) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem>
                        <ListItemIcon>
                          <ErrorIcon sx={{ color: '#f44336' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={error.fileName} 
                          secondary={error.error} 
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        {/* Boutons d'action */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: activeStep === 2 ? 'center' : 'flex-start' }}>
          {activeStep === 0 && (
            <Button
              variant="contained"
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              startIcon={<CloudUploadIcon />}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
            >
              Télécharger {files.length > 0 ? `(${files.length} fichiers)` : ''}
            </Button>
          )}
          
          {activeStep === 1 && !uploading && (
            <Button
              variant="contained"
              onClick={uploadFiles}
              disabled={uploading}
              startIcon={<CloudUploadIcon />}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
            >
              Reprendre le téléchargement
            </Button>
          )}
          
          {activeStep === 2 && (
            <Button
              variant="contained"
              onClick={goToDashboard}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
            >
              Voir mes conversations
            </Button>
          )}
          
          {activeStep < 2 && (
            <Button
              variant="outlined"
              onClick={goToDashboard}
              disabled={uploading}
            >
              Annuler
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default WhatsAppUpload;
