import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from './use-me';

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

export interface ProfileSkill {
  skill_id: number;
  years_of_experience: number;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  address?: string | null;
  profile_picture?: string | null;
  // Teacher-specific fields
  title?: string | null;
  introduction_video?: string | null;
  base_pay?: number | null;
  skills?: ProfileSkill[];
}

interface UpdateProfileResponse {
  user: UserProfile;
}

const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const url = joinUrl('me');
  const headers = getAuthHeaders();

  console.log('🔵 Updating profile:', { url, data });

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  const text = await response.text();
  console.log('🔵 Profile Update Response Status:', response.status);
  console.log('🔵 Profile Update Response Text:', text.substring(0, 500));

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
      `Failed to update profile (${response.status})`;
    console.error('🔴 Profile Update Error:', errorMessage);
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update profile');
  }

  const responseData = result as UpdateProfileResponse;
  console.log('✅ Successfully updated profile');
  
  // Update localStorage user data
  if (typeof window !== 'undefined' && responseData.user) {
    try {
      localStorage.setItem('user', JSON.stringify(responseData.user));
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: responseData.user }));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
  }
  
  return responseData.user;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.setQueryData(['me'], data);
    },
    onError: (error) => {
      console.error('🔴 Profile update mutation error:', error);
    },
  });
};

