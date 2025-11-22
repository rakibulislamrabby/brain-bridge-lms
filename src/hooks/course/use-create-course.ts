import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || '';

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path;
  if (!API_BASE_URL) {
    return `/${trimmedPath}`;
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}/${trimmedPath}`;
};

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export interface VideoRequest {
  title: string;
  description: string;
  duration_hours: number;
  is_published: number | boolean;
}

export interface ModuleRequest {
  title: string;
  description: string;
  order_index: number;
  videos: VideoRequest[];
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  subject_id: number;
  price: number;
  old_price?: number;
  is_published: number | boolean;
  modules: ModuleRequest[];
}

interface CreateCourseResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

const createCourse = async (payload: CreateCourseRequest & { thumbnail?: File | null; videoFiles?: Record<string, File> }): Promise<CreateCourseResponse> => {
  const url = joinUrl('courses');
  
  // Check if we need to send files (FormData) or just JSON
  const hasFiles = payload.thumbnail || (payload.videoFiles && Object.keys(payload.videoFiles).length > 0);
  
  let body: FormData | string;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };

  if (hasFiles) {
    // Use FormData for file uploads
    const formData = new FormData();
    
    // Add course fields
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('subject_id', payload.subject_id.toString());
    formData.append('price', payload.price.toString());
    if (payload.old_price !== undefined) {
      formData.append('old_price', payload.old_price.toString());
    }
    formData.append('is_published', payload.is_published ? '1' : '0');
    
    // Add thumbnail if present
    if (payload.thumbnail) {
      formData.append('thumbnail', payload.thumbnail);
    }
    
    // Add modules as JSON string (nested structure)
    payload.modules.forEach((module, moduleIndex) => {
      formData.append(`modules[${moduleIndex}][title]`, module.title);
      formData.append(`modules[${moduleIndex}][description]`, module.description);
      formData.append(`modules[${moduleIndex}][order_index]`, module.order_index.toString());
      
      module.videos.forEach((video, videoIndex) => {
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][title]`, video.title);
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][description]`, video.description);
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][duration_hours]`, video.duration_hours.toString());
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][is_published]`, video.is_published ? '1' : '0');
        
        // Add video file if present
        const videoFileKey = `${moduleIndex}_${videoIndex}`;
        if (payload.videoFiles && payload.videoFiles[videoFileKey]) {
          formData.append(`modules[${moduleIndex}][videos][${videoIndex}][file]`, payload.videoFiles[videoFileKey]);
        }
      });
    });
    
    body = formData;
    // Don't set Content-Type for FormData, browser will set it with boundary
  } else {
    // Use JSON if no files
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    
    const jsonPayload: any = {
      title: payload.title,
      description: payload.description,
      subject_id: payload.subject_id,
      price: payload.price,
      is_published: payload.is_published ? 1 : 0,
      modules: payload.modules.map(module => ({
        title: module.title,
        description: module.description,
        order_index: module.order_index,
        videos: module.videos.map(video => ({
          title: video.title,
          description: video.description,
          duration_hours: video.duration_hours,
          is_published: video.is_published ? 1 : 0,
        })),
      })),
    };
    
    if (payload.old_price !== undefined) {
      jsonPayload.old_price = payload.old_price;
    }
    
    body = JSON.stringify(jsonPayload);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });
  } catch (networkError) {
    console.error('Create course network error:', networkError);
    throw new Error('Unable to reach the Brain Bridge API. Please verify your connection and try again.');
  }

  let result: CreateCourseResponse = { success: false, message: '' };
  try {
    result = await response.json();
  } catch (error) {
    if (response.status !== 204) {
      throw new Error('Invalid response from server');
    }
  }

  if (!response.ok) {
    const errorMessage = (result as any)?.message || (result as any)?.error || `Failed to create course (${response.status})`;
    throw new Error(errorMessage);
  }

  return result;
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
