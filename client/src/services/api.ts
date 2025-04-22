import axios from 'axios';
import { HtmlFile, SearchParams } from '../types/types';

const API_URL = process.env.REACT_APP_API_URL || '';
const api = axios.create({
  baseURL: API_URL
});

// File upload services
export const uploadHtmlFile = async (file: File) => {
  const formData = new FormData();
  formData.append('htmlFile', file);
  
  const response = await api.post('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const uploadMultipleFiles = async (files: File[]) => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await api.post('/api/files/upload-bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// File retrieval services
export const getAllFiles = async (page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc') => {
  const response = await api.get(`/api/files?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`);
  return response.data;
};

export const getFileById = async (id: string) => {
  const response = await api.get(`/api/files/${id}`);
  return response.data;
};

export const deleteFile = async (id: string) => {
  const response = await api.delete(`/api/files/${id}`);
  return response.data;
};

// Search services
export const searchFiles = async (params: SearchParams) => {
  const { search, mediaType, startDate, endDate, sortField, sortOrder, page = 1, limit = 10 } = params;
  
  let queryParams = `page=${page}&limit=${limit}`;
  
  if (search) queryParams += `&search=${encodeURIComponent(search)}`;
  if (mediaType) queryParams += `&mediaType=${mediaType}`;
  if (startDate) queryParams += `&startDate=${startDate}`;
  if (endDate) queryParams += `&endDate=${endDate}`;
  if (sortField) queryParams += `&sortField=${sortField}`;
  if (sortOrder) queryParams += `&sortOrder=${sortOrder}`;
  
  const response = await api.get(`/api/search?${queryParams}`);
  return response.data;
};

export const getSearchSuggestions = async (term: string) => {
  if (!term || term.length < 2) return { suggestions: [] };
  
  const response = await api.get(`/api/search/suggestions?term=${encodeURIComponent(term)}`);
  return response.data;
};

export const getFileStats = async () => {
  const response = await api.get('/api/search/stats');
  return response.data;
};
