import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// API function to fetch users
const fetchUsers = async (): Promise<UserResponse[]> => {
  const url = `${API_BASE_URL}users`;
  const headers = getAuthHeaders();
  
  console.log('Fetching users from:', url);
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
      const errorMessage = result?.message || result?.error || `Failed to fetch users (${response.status})`;
      console.error('API error:', errorMessage, result);
      throw new Error(errorMessage);
    }

    // Handle different response formats
    if (Array.isArray(result)) {
      console.log('Users fetched successfully:', result.length, 'items');
      return result;
    } else if (result?.data && Array.isArray(result.data)) {
      console.log('Users fetched successfully (from data field):', result.data.length, 'items');
      return result.data;
    } else if (result?.users && Array.isArray(result.users)) {
      console.log('Users fetched successfully (from users field):', result.users.length, 'items');
      return result.users;
    } else {
      // If it's a single object, wrap it in an array
      if (result && typeof result === 'object' && result.id) {
        console.log('Single user returned, wrapped in array');
        return [result];
      }
      // Return empty array if no valid data found
      console.warn('Unexpected API response format:', result);
      return [];
    }
  } catch (error) {
    console.error('Fetch users error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Failed to fetch users');
  }
};

// API function to delete a user
const deleteUser = async (id: number): Promise<void> => {
  const url = `${API_BASE_URL}users/${id}`;
  const headers = getAuthHeaders();
  
  console.log('Deleting user:', { url, id });

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
  });

  if (!response.ok) {
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error(`Failed to delete user (${response.status})`);
    }
    const errorMessage = result?.message || result?.error || `Failed to delete user (${response.status})`;
    throw new Error(errorMessage);
  }
};

// Custom hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate and refetch users list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    },
  });
};

// Custom hook to fetch users
export const useUserList = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 60 * 1000, // 1 minute
  });
};
