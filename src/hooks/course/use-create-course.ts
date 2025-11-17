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

interface CreateCourseSlotRequest {
  start_time: string;
  end_time: string;
}

export interface CreateCourseRequest {
  subject_id: number;
  title: string;
  from_date: string;
  to_date: string;
  slots: CreateCourseSlotRequest[];
  type: string;
  price: number;
  max_students: number;
  description: string;
}

interface CreateCourseResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

const createCourse = async (payload: CreateCourseRequest): Promise<CreateCourseResponse> => {
  const headers = {
    ...getAuthHeaders(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const url = joinUrl('courses');

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
