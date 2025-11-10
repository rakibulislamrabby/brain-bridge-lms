import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || '';

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path;
  if (!API_BASE_URL) {
    return `/${trimmedPath}`;
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}/${trimmedPath}`;
};

// Helper functions
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
  bio?: string;
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
  level?: string;
  language?: string;
  duration?: string | number;
  original_price?: string | number;
  features?: string[];
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

const normalizeCourse = (result: any): CourseResponse | null => {
  if (!result) {
    return null;
  }

  if (Array.isArray(result)) {
    return result.length > 0 ? (result[0] as CourseResponse) : null;
  }

  if (result?.data) {
    if (Array.isArray(result.data)) {
      return result.data.length > 0 ? (result.data[0] as CourseResponse) : null;
    }
    if (result.data && typeof result.data === 'object') {
      return result.data as CourseResponse;
    }
  }

  if (result?.course && typeof result.course === 'object') {
    return result.course as CourseResponse;
  }

  if (result && typeof result === 'object' && result.id) {
    return result as CourseResponse;
  }

  return null;
};

const fetchCourses = async (): Promise<CourseResponse[]> => {
  const url = joinUrl('courses');
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

const deleteCourse = async (id: number): Promise<void> => {
  const url = joinUrl(`courses/${id}`);
  const headers = {
    ...getAuthHeaders(),
    Accept: 'application/json',
  };

  console.log('Deleting course:', id, url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      let result: any = null;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : null;
      } catch (parseError) {
        // ignore parse error, use generic message below
      }

      const errorMessage = result?.message || result?.error || `Failed to delete course (${response.status})`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Delete course error:', error); 
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to delete course');
  }
};

const fetchCourse = async (id: number): Promise<CourseResponse> => {
  const url = joinUrl(`courses/${id}`);
  const headers = getAuthHeaders();

  console.log('Fetching course detail from:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch course (${response.status})`;
      throw new Error(errorMessage);
    }

    const course = normalizeCourse(result);
    if (!course) {
      throw new Error('Course not found');
    }

    return course;
  } catch (error) {
    console.error('Fetch course error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch course');
  }
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 60 * 1000,
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id),
    enabled: Number.isFinite(id),
    staleTime: 60 * 1000,
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
