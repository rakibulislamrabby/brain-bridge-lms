import { useQuery } from '@tanstack/react-query';
import { CourseResponse } from '../use-courses';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || '';

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path;
  if (!API_BASE_URL) {
    return `/${trimmedPath}`;
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}/${trimmedPath}`;
};

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

const fetchPublicCourses = async (): Promise<CourseResponse[]> => {
  // Ensure we fetch exactly from "public-courses" endpoint
  const url = joinUrl('public-courses');
  
  console.log('Fetching public courses from:', url, 'API_BASE_URL:', API_BASE_URL);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status, response.statusText);

    const text = await response.text();
    console.log('Response text (first 500 chars):', text.substring(0, 500));
    
    let result: any = null;
    try {
      result = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch public courses (${response.status})`;
      console.error('API error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Handle the response structure: { success: true, data: [...] }
    let courses: CourseResponse[] = [];
    
    if (result?.success && Array.isArray(result.data)) {
      console.log('Found success response with data array, length:', result.data.length);
      courses = normalizeCourseArray(result.data);
    } else if (result?.data && Array.isArray(result.data)) {
      console.log('Found data array, length:', result.data.length);
      courses = normalizeCourseArray(result.data);
    } else if (Array.isArray(result)) {
      console.log('Result is array, length:', result.length);
      courses = normalizeCourseArray(result);
    } else {
      console.warn('Unexpected response structure:', result);
      courses = normalizeCourseArray(result);
    }

    console.log('Public courses fetched successfully:', courses.length);
    return courses;
  } catch (error) {
    console.error('Fetch public courses error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch public courses');
  }
};

const fetchPublicCourse = async (id: number): Promise<CourseResponse> => {
  // Ensure we fetch exactly from "public-courses/{id}" endpoint
  const url = joinUrl(`public-courses/${id}`);
  
  console.log('Fetching public course detail from:', url, 'API_BASE_URL:', API_BASE_URL);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status, response.statusText);

    const text = await response.text();
    console.log('Response text (first 500 chars):', text.substring(0, 500));
    
    let result: any = null;
    try {
      result = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch public course (${response.status})`;
      console.error('API error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Handle the response structure: { success: true, data: {...} }
    let course: CourseResponse | null = null;
    
    if (result?.success && result?.data && typeof result.data === 'object') {
      console.log('Found success response with data object');
      course = normalizeCourse(result.data);
    } else if (result?.data && typeof result.data === 'object') {
      console.log('Found data object');
      course = normalizeCourse(result.data);
    } else {
      console.log('Normalizing whole result');
      course = normalizeCourse(result);
    }

    if (!course) {
      throw new Error('Course not found');
    }

    console.log('Public course fetched successfully:', course.id);
    return course;
  } catch (error) {
    console.error('Fetch public course error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch public course');
  }
};

export const usePublicCourses = () => {
  return useQuery({
    queryKey: ['public-courses'],
    queryFn: fetchPublicCourses,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const usePublicCourse = (id: number) => {
  return useQuery({
    queryKey: ['public-courses', id],
    queryFn: () => fetchPublicCourse(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000, // 1 minute
  });
};
