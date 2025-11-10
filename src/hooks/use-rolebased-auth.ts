import { useMutation } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || 'http://192.168.1.108:8000/api/';

export interface RegisterTeacherRequest {
  name: string;
  email: string;
  password: string;
  title: string;
}

export interface RegisterStudentRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  access_token?: string;
  token_type?: string;
  user?: any;
}

// API function to register a teacher
const registerTeacher = async (data: RegisterTeacherRequest): Promise<AuthResponse> => {
  // Clean data - remove any empty strings or undefined values
  const cleanData = {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
    title: data.title.trim()
  };
  
  // Validate required fields
  if (!cleanData.name || !cleanData.email || !cleanData.password || !cleanData.title) {
    throw new Error('All fields are required for teacher registration');
  }
  
  const url = `${API_BASE_URL}teachers`;
  console.log('Registering as Master/Teacher - POST:', { url, data: cleanData });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanData),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Teacher registration failed:', result);
    throw new Error(result.message || result.error || 'Teacher registration failed');
  }

  console.log('Teacher registration successful:', result);
  return result;
};

// API function to register a student
const registerStudent = async (data: RegisterStudentRequest): Promise<AuthResponse> => {
  // Clean data - remove any empty strings or undefined values
  const cleanData = {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password
  };
  
  // Validate required fields
  if (!cleanData.name || !cleanData.email || !cleanData.password) {
    throw new Error('All fields are required for student registration');
  }
  
  const url = `${API_BASE_URL}students`;
  console.log('Registering as Student - POST:', { url, data: cleanData });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanData),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Student registration failed:', result);
    throw new Error(result.message || result.error || 'Student registration failed');
  }

  console.log('Student registration successful:', result);
  return result;
};

// Custom hook to register a teacher
export const useRegisterTeacher = () => {
  return useMutation({
    mutationFn: registerTeacher,
    onSuccess: (data) => {
      // Store token in localStorage if available (client-side only)
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        // Also set cookie for middleware
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = `token=${data.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      }
    },
    onError: (error) => {
      console.error('Teacher registration error:', error);
    },
  });
};

// Custom hook to register a student
export const useRegisterStudent = () => {
  return useMutation({
    mutationFn: registerStudent,
    onSuccess: (data) => {
      // Store token in localStorage if available (client-side only)
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        // Also set cookie for middleware
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = `token=${data.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      }
    },
    onError: (error) => {
      console.error('Student registration error:', error);
    },
  });
};

