import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export interface SkillSubject {
  id: number;
  name: string;
  parent_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: number;
  name: string;
  subject_id: number;
  created_at?: string;
  updated_at?: string;
  subject?: SkillSubject;
}

export interface CreateSkillRequest {
  name: string;
  subject_id: number;
}

export interface SkillResponse {
  id: number;
  name: string;
  subject_id: number;
  created_at?: string;
  updated_at?: string;
  subject?: SkillSubject;
}

// API function to create a skill
const createSkill = async (data: CreateSkillRequest): Promise<SkillResponse> => {
  const response = await fetch(`${API_BASE_URL}skills`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  let result;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    const errorMessage = result?.message || result?.error || `Failed to create skill (${response.status})`;
    throw new Error(errorMessage);
  }

  return result;
};

// API function to fetch skills
const fetchSkills = async (): Promise<SkillResponse[]> => {
  const url = `${API_BASE_URL}skills`;
  const headers = getAuthHeaders();
  
  console.log('Fetching skills from:', url);
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
      const errorMessage = result?.message || result?.error || `Failed to fetch skills (${response.status})`;
      console.error('API error:', errorMessage, result);
      throw new Error(errorMessage);
    }

    // Handle different response formats
    if (Array.isArray(result)) {
      console.log('Skills fetched successfully:', result.length, 'items');
      return result;
    } else if (result?.data && Array.isArray(result.data)) {
      console.log('Skills fetched successfully (from data field):', result.data.length, 'items');
      return result.data;
    } else if (result?.skills && Array.isArray(result.skills)) {
      console.log('Skills fetched successfully (from skills field):', result.skills.length, 'items');
      return result.skills;
    } else {
      // If it's a single object, wrap it in an array
      if (result && typeof result === 'object' && result.id) {
        console.log('Single skill returned, wrapped in array');
        return [result];
      }
      // Return empty array if no valid data found
      console.warn('Unexpected API response format:', result);
      return [];
    }
  } catch (error) {
    console.error('Fetch skills error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch skills');
  }
};

// API function to delete a skill
const deleteSkill = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}skills/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error(`Failed to delete skill (${response.status})`);
    }
    const errorMessage = result?.message || result?.error || `Failed to delete skill (${response.status})`;
    throw new Error(errorMessage);
  }
};

// Custom hook to create a skill
export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      // Invalidate and refetch skills list after successful creation
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (error) => {
      console.error('Create skill error:', error);
    },
  });
};

// Custom hook to delete a skill
export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      // Invalidate and refetch skills list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (error) => {
      console.error('Delete skill error:', error);
    },
  });
};

// Custom hook to fetch skills
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
    staleTime: 60 * 1000, // 1 minute
  });
};

