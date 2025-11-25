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

export interface TeacherReviewRequest {
  slot_id: number;
  rating: number;
  comment: string;
}

export interface TeacherReviewResponse {
  message?: string;
  data?: {
    id: number;
    slot_id: number;
    rating: number;
    comment: string;
    created_at?: string;
    updated_at?: string;
  };
}

const submitTeacherReview = async (data: TeacherReviewRequest): Promise<TeacherReviewResponse> => {
  const url = joinUrl('reviews/teacher');
  const headers = getAuthHeaders();

  console.log('🔵 Submitting teacher review:', { url, data });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const text = await response.text();
  console.log('🔵 Teacher Review Response Status:', response.status);
  console.log('🔵 Teacher Review Response Text:', text.substring(0, 500));

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
    console.error('🔴 Teacher Review Error:', errorMessage);
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to submit review');
  }

  console.log('✅ Successfully submitted teacher review');
  return result as TeacherReviewResponse;
};

export const useTeacherReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitTeacherReview,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['student-booked-slots'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (error) => {
      console.error('🔴 Teacher review mutation error:', error);
    },
  });
};

