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
  profile_picture?: string | null | File;
  // Teacher-specific fields
  title?: string | null;
  introduction_video?: string | null | File;
  base_pay?: number | null;
  skills?: ProfileSkill[];
}

interface UpdateProfileResponse {
  user: UserProfile;
}

const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const url = joinUrl('me');
  
  // Check if we need to send files (FormData) or just JSON
  // Match course thumbnail pattern - check if File instance
  const hasProfilePicture = data.profile_picture instanceof File;
  const hasIntroductionVideo = data.introduction_video instanceof File;
  const hasFiles = hasProfilePicture || hasIntroductionVideo;
  
  console.log('🔍 File detection:', {
    hasProfilePicture,
    hasIntroductionVideo,
    hasFiles,
    profilePictureType: data.profile_picture ? (data.profile_picture instanceof File ? 'File' : typeof data.profile_picture) : 'undefined',
    profilePictureValue: data.profile_picture instanceof File ? `${data.profile_picture.name} (${data.profile_picture.size} bytes)` : data.profile_picture
  });
  
  let body: FormData | string;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Add Authorization header
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (hasFiles) {
    // Use FormData for file uploads
    const formData = new FormData();
    
    // Add basic fields - include all fields when using FormData
    if (data.name !== undefined) formData.append('name', data.name || '');
    if (data.email !== undefined) formData.append('email', data.email || '');
    if (data.phone !== undefined) formData.append('phone', data.phone || '');
    if (data.bio !== undefined) formData.append('bio', data.bio || '');
    if (data.address !== undefined) formData.append('address', data.address || '');
    
    // Add profile picture file if present - match course thumbnail pattern
    if (hasProfilePicture && data.profile_picture instanceof File) {
      console.log('📎 Appending profile picture file:', data.profile_picture.name, data.profile_picture.size, 'bytes', 'Type:', data.profile_picture.type);
      formData.append('profile_picture', data.profile_picture);
    }
    // Don't send profile_picture at all if no file - prevents null from being sent
    
    // Add teacher-specific fields
    if (data.title !== undefined) formData.append('title', data.title || '');
    if (data.base_pay !== undefined && data.base_pay !== null) {
      formData.append('base_pay', data.base_pay.toString());
    }
    
    // Add introduction video file if present
    if (hasIntroductionVideo && data.introduction_video instanceof File) {
      console.log('📎 Appending introduction video file:', data.introduction_video.name, data.introduction_video.size, 'bytes');
      formData.append('introduction_video', data.introduction_video);
    } else if (data.introduction_video !== undefined && data.introduction_video !== null && typeof data.introduction_video === 'string' && data.introduction_video.trim() !== '') {
      // If it's a string (URL), append it
      console.log('🔗 Appending introduction video URL:', data.introduction_video);
      formData.append('introduction_video', data.introduction_video);
    }
    
    // Add skills if present
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      data.skills.forEach((skill, index) => {
        formData.append(`skills[${index}][skill_id]`, skill.skill_id.toString());
        formData.append(`skills[${index}][years_of_experience]`, skill.years_of_experience.toString());
      });
    }
    
    // Log FormData contents for debugging
    console.log('📦 FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    body = formData;
    // Don't set Content-Type for FormData, browser will set it with boundary
    delete headers['Content-Type'];
  } else {
    // Use JSON if no files
    // Remove file fields from data if they're undefined/null (to prevent sending null/undefined)
    const jsonData: any = { ...data };
    // Remove profile_picture if it's undefined (only include if it's a string URL)
    if (jsonData.profile_picture === undefined || jsonData.profile_picture === null || jsonData.profile_picture instanceof File) {
      delete jsonData.profile_picture;
    }
    // Remove introduction_video if it's undefined (only include if it's a string URL)
    if (jsonData.introduction_video === undefined || jsonData.introduction_video === null || jsonData.introduction_video instanceof File) {
      delete jsonData.introduction_video;
    }
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(jsonData);
  }

  console.log('🔵 Updating profile:', { url, hasFiles, method: hasFiles ? 'FormData' : 'JSON' });

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body,
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
      (typeof errorObj?.data === 'object' && errorObj.data !== null ? JSON.stringify(errorObj.data) : null) ||
      `Failed to update profile (${response.status})`;
    console.error('🔴 Profile Update Error:', {
      status: response.status,
      statusText: response.statusText,
      errorMessage,
      fullError: errorObj
    });
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


