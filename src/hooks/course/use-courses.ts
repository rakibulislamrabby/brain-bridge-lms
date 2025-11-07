import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || 'http://192.168.1.108:8000/api/';

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

export interface CourseModuleSummary {
  id: number;
  title: string;
  description?: string | null;
  order_index?: number;
  videos_count?: number;
}

export interface CourseVideoSummary {
  id: number;
  title: string;
  description?: string | null;
  duration_hours?: string | number;
  is_published?: boolean | number;
}

export interface CourseSubjectSummary {
  id: number;
  name: string;
}

export interface CourseTeacherSummary {
  id: number;
  name: string;
  email?: string;
}

export interface CourseResponse {
  id: number;
  title: string;
  description?: string | null;
  subject_id?: number;
  subject?: CourseSubjectSummary | null;
  subject_name?: string;
  price?: string | number;
  old_price?: string | number;
  is_published?: boolean | number;
  status?: string;
  teacher_id?: number;
  teacher?: CourseTeacherSummary | null;
  teacher_name?: string;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
  modules?: CourseModuleSummary[];
  modules_count?: number;
  videos?: CourseVideoSummary[];
  videos_count?: number;
  students_count?: number;
  total_students?: number;
  average_rating?: number;
  rating?: number;
}

const normalizeCourseArray = (result: any): CourseResponse[] => {
  if (Array.isArray(result)) {
    return result as CourseResponse[];
  }

  if (result?.data && Array.isArray(result.data)) {
    return result.data as CourseResponse[];
  }

  if (result?.courses && Array.isArray(result.courses)) {
    return result.courses as CourseResponse[];
  }

  if (result && typeof result === 'object' && result.id) {
    return [result as CourseResponse];
  }

  return [];
};

const fetchCourses = async (): Promise<CourseResponse[]> => {
  const url = `${API_BASE_URL}courses`;
  const headers = getAuthHeaders();

  console.log('Fetching courses from:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch courses (${response.status})`;
      throw new Error(errorMessage);
    }

    const courses = normalizeCourseArray(result);
    console.log('Courses fetched successfully:', courses.length);
    return courses;
  } catch (error) {
    console.error('Fetch courses error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch courses');
  }
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 60 * 1000,
  });
};
