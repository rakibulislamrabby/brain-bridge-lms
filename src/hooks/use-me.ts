import { useQuery } from '@tanstack/react-query';

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

export interface UserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface TeacherLevel {
  id: number;
  level_name: string;
  min_rating: number;
  max_rating: number;
  benefits: string;
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  teacher_level_id: number;
  title: string;
  introduction_video?: string | null;
  base_pay: string;
  total_sessions: number;
  average_rating: number;
  five_star_reviews?: number;
  streak_good_sessions?: number;
  rebook_count?: number;
  cancelled_sessions?: number;
  created_at?: string;
  updated_at?: string;
  teacher_level?: TeacherLevel;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  firebase_uid?: string;
  email_verified_at?: string | null;
  bio?: string | null;
  address?: string | null;
  profile_picture?: string | null;
  is_active?: number;
  points?: number;
  referral_code?: string | null;
  google_access_token?: string | null;
  google_refresh_token?: string | null;
  google_token_expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: UserRole[];
  teacher?: Teacher | null;
  transaction?: any[];
  role?: string;
  title?: string;
  teacher_level?: string;
}

interface MeResponse {
  user: UserProfile;
}

const fetchMe = async (): Promise<UserProfile> => {
  const headers = {
    ...getAuthHeaders(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const url = joinUrl('me');

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.status}`);
  }

  const result: MeResponse = await response.json();
  return result.user;
};

export interface UseMeResult {
  data: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useMe = (): UseMeResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: data || null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch();
    },
  };
};

