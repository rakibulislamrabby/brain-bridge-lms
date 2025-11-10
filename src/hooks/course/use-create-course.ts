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

export interface CreateVideoRequest {
  title: string;
  description: string;
  duration_hours: string;
  is_published: boolean;
  file?: File | null;
}

export interface CreateModuleRequest {
  title: string;
  description: string;
  order_index: number;
  videos: CreateVideoRequest[];
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  subject_id: string;
  price: string;
  old_price?: string;
  is_published: boolean;
  teacher_id: string;
  thumbnail?: File | null;
  modules: CreateModuleRequest[];
}

interface CreateCourseResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

const createCourse = async (payload: CreateCourseRequest): Promise<CreateCourseResponse> => {
  const formData = new FormData();

  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('subject_id', payload.subject_id);
  formData.append('price', payload.price);
  formData.append('is_published', payload.is_published ? '1' : '0');
  formData.append('teacher_id', payload.teacher_id);

  if (payload.old_price && payload.old_price.trim().length > 0) {
    formData.append('old_price', payload.old_price);
  }

  if (payload.thumbnail) {
    formData.append('thumbnail_url', payload.thumbnail, payload.thumbnail.name);
  }

  payload.modules.forEach((module, moduleIndex) => {
    formData.append(`modules[${moduleIndex}][title]`, module.title);
    formData.append(`modules[${moduleIndex}][description]`, module.description);
    formData.append(`modules[${moduleIndex}][order_index]`, module.order_index.toString());

    module.videos.forEach((video, videoIndex) => {
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][title]`, video.title);
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][description]`, video.description);
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][duration_hours]`, video.duration_hours);
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][is_published]`, video.is_published ? '1' : '0');

      if (video.file) {
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][file]`, video.file, video.file.name);
      }
    });
  });

  const headers = {
    ...getAuthHeaders(),
    Accept: 'application/json',
  };

  const url = joinUrl('courses');

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (networkError) {
    console.error('Create course network error:', networkError);
    throw new Error('Unable to reach the Brain Bridge API. Please verify your connection and try again.');
  }

  let result: CreateCourseResponse;
  try {
    const text = await response.text();
    result = text ? JSON.parse(text) : ({} as CreateCourseResponse);
  } catch (error) {
    throw new Error('Invalid response from server');
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
