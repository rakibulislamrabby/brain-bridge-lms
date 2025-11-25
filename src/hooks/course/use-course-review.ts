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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export interface CourseReviewRequest {
  course_id: number;
  rating: number;
  comment: string;
}

export interface CourseReviewResponse {
  message?: string;
  data?: {
    id: number;
    course_id: number;
    rating: number;
    comment: string;
    created_at?: string;
    updated_at?: string;
  };
}

const submitCourseReview = async (data: CourseReviewRequest): Promise<CourseReviewResponse> => {
  const url = joinUrl('reviews/course');
  const headers = getAuthHeaders();

  console.log('🔵 Submitting course review:', { url, data });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const text = await response.text();
  console.log('🔵 Course Review Response Status:', response.status);
  console.log('🔵 Course Review Response Text:', text.substring(0, 500));

  let result: unknown = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch (parseError) {
    console.error('🔴 JSON Parse Error:', parseError);
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    const errorObj = result as Record<string, unknown>;
    const errorMessage =
      errorObj?.message ||
      errorObj?.error ||
      (typeof errorObj?.data === 'string' ? errorObj.data : null) ||
      `Failed to submit review (${response.status})`;
    console.error('🔴 Course Review Error:', errorMessage);
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to submit review');
  }

  console.log('✅ Successfully submitted course review');
  return result as CourseReviewResponse;
};

export const useCourseReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCourseReview,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['public-courses', variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ['public-courses'] });
    },
    onError: (error) => {
      console.error('🔴 Course review mutation error:', error);
    },
  });
};

