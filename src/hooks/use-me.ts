import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || 'http://192.168.1.108:8000/api/';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to get auth headers
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
  created_at?: string;
  updated_at?: string;
  roles?: UserRole[];
  teacher?: Teacher;
  // Computed fields
  role?: string; // Extracted from roles array
  title?: string; // From teacher.title
  teacher_level?: string; // From teacher.teacher_level.level_name
}

// API function to fetch current user profile
const fetchMe = async (): Promise<UserProfile> => {
  const url = `${API_BASE_URL}me`;
  const headers = getAuthHeaders();
  
  console.log('Fetching user profile from:', url);
  console.log('Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'None' });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    console.log('Response status:', response.status, response.statusText);

    let result;
    try {
      const text = await response.text();
      console.log('Response text:', text);
      result = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch profile (${response.status})`;
      console.error('API error:', errorMessage, result);
      throw new Error(errorMessage);
    }

    console.log('User profile fetched successfully:', result);
    
    // Handle the API response structure: { user: {...} }
    let userData: any = null;
    
    if (result?.user && typeof result.user === 'object' && result.user.id) {
      userData = result.user;
      console.log('Found user in result.user');
    } else if (result?.data?.user && typeof result.data.user === 'object' && result.data.user.id) {
      userData = result.data.user;
      console.log('Found user in result.data.user');
    } else if (result && typeof result === 'object' && result.id) {
      userData = result;
      console.log('Found user in result directly');
    }
    
    if (!userData || !userData.id || !userData.name || !userData.email) {
      console.error('Unable to parse user profile from response:', result);
      throw new Error(`Unexpected API response format. Received: ${JSON.stringify(result).substring(0, 200)}`);
    }
    
    // Extract role from roles array
    const roleName = userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0
      ? userData.roles[0].name
      : undefined;
    
    // Extract title from teacher object
    const title = userData.teacher?.title;
    
    // Extract teacher level
    const teacherLevel = userData.teacher?.teacher_level?.level_name;
    
    // Build the profile object
    const userProfile: UserProfile = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      firebase_uid: userData.firebase_uid,
      email_verified_at: userData.email_verified_at,
      bio: userData.bio,
      address: userData.address,
      profile_picture: userData.profile_picture,
      is_active: userData.is_active,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      roles: userData.roles,
      teacher: userData.teacher,
      // Computed fields
      role: roleName,
      title: title,
      teacher_level: teacherLevel,
    };
    
    console.log('Processed user profile:', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Fetch profile error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the Brain Bridge API. Please verify your network connection and API base URL.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch profile');
  }
};

// Custom hook to fetch current user profile
export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

