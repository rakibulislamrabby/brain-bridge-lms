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

export interface Subject {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface CreateSubjectRequest {
  name: string;
  parent_id: number | null;
}

export interface SubjectResponse {
  id: number;
  name: string;
  parent_id: number | null;
  created_at?: string;
  updated_at?: string;
}

// API function to create a subject
const createSubject = async (data: CreateSubjectRequest): Promise<SubjectResponse> => {
  const response = await fetch(`${API_BASE_URL}subjects`, {
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
    const errorMessage = result?.message || result?.error || `Failed to create subject (${response.status})`;
    throw new Error(errorMessage);
  }

  return result;
};

// API function to fetch subjects
const fetchSubjects = async (): Promise<SubjectResponse[]> => {
  const url = `${API_BASE_URL}subjects`;
  const headers = getAuthHeaders();
  
  console.log('Fetching subjects from:', url);
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
      const errorMessage = result?.message || result?.error || `Failed to fetch subjects (${response.status})`;
      console.error('API error:', errorMessage, result);
      throw new Error(errorMessage);
    }

    // Handle different response formats
    // If the API returns { data: [...] }, extract the data array
    // Otherwise, assume result is already an array
    if (Array.isArray(result)) {
      console.log('Subjects fetched successfully:', result.length, 'items');
      return result;
    } else if (result?.data && Array.isArray(result.data)) {
      console.log('Subjects fetched successfully (from data field):', result.data.length, 'items');
      return result.data;
    } else if (result?.subjects && Array.isArray(result.subjects)) {
      console.log('Subjects fetched successfully (from subjects field):', result.subjects.length, 'items');
      return result.subjects;
    } else {
      // If it's a single object, wrap it in an array
      if (result && typeof result === 'object' && result.id) {
        console.log('Single subject returned, wrapped in array');
        return [result];
      }
      // Return empty array if no valid data found
      console.warn('Unexpected API response format:', result);
      return [];
    }
  } catch (error) {
    console.error('Fetch subjects error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch subjects');
  }
};

// Custom hook to create a subject
export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      // Invalidate and refetch subjects list after successful creation
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      console.error('Create subject error:', error);
    },
  });
};

// API function to delete a subject
const deleteSubject = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}subjects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error(`Failed to delete subject (${response.status})`);
    }
    const errorMessage = result?.message || result?.error || `Failed to delete subject (${response.status})`;
    throw new Error(errorMessage);
  }
};

// Custom hook to delete a subject
export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      // Invalidate and refetch subjects list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      console.error('Delete subject error:', error);
    },
  });
};

// Custom hook to fetch subjects
export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
    staleTime: 60 * 1000, // 1 minute
  });
};

