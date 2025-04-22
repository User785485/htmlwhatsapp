export interface Media {
  _id?: string;
  type: 'image' | 'video' | 'audio' | 'other';
  path: string;
  originalName: string;
  size?: number;
}

export interface HtmlFile {
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

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SearchParams {
  search?: string;
  mediaType?: string;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
