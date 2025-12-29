import { useMutation } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || 'http://192.168.1.108:8000/api/';

export interface RegisterTeacherRequest {
  name: string;
  email: string;
  password: string;
  title: string;
  address?: string | null;
  date_of_birth?: string | null;
  profile_picture?: File | null;
}

export interface RegisterStudentRequest {
  name: string;
  email: string;
  password: string;
  referral_code?: string;
  address?: string | null;
  date_of_birth?: string | null;
}

export interface AuthResponse {
  message?: string;
  access_token?: string;
  token_type?: string;
  user?: any;
}

// API function to register a teacher
const registerTeacher = async (data: RegisterTeacherRequest): Promise<AuthResponse> => {
  // Check if we need to send FormData (if profile_picture is a File)
  const hasProfilePicture = data.profile_picture instanceof File;
  
  let body: FormData | string;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Get auth token if available (for consistency)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (hasProfilePicture) {
    // Use FormData for file upload
    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('email', data.email.trim());
    formData.append('password', data.password);
    formData.append('title', data.title.trim());
    
    if (data.address && data.address.trim()) {
      formData.append('address', data.address.trim());
    }
    if (data.date_of_birth) {
      formData.append('date_of_birth', data.date_of_birth);
    }
    if (data.profile_picture instanceof File) {
      formData.append('profile_picture', data.profile_picture);
    }
    
    body = formData;
    // Don't set Content-Type for FormData - browser will set it with boundary
  } else {
    // Use JSON if no file
    const cleanData: any = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      title: data.title.trim()
    };
    
    if (data.address && data.address.trim()) {
      cleanData.address = data.address.trim();
    }
    if (data.date_of_birth) {
      cleanData.date_of_birth = data.date_of_birth;
    }
    
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(cleanData);
  }
  
  // Validate required fields
  if (!data.name.trim() || !data.email.trim() || !data.password || !data.title.trim()) {
    throw new Error('All required fields must be filled for teacher registration');
  }
  
  const url = `${API_BASE_URL}teachers`;
  console.log('Registering as Master/Teacher - POST:', { url, hasFile: hasProfilePicture });
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
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
  const cleanData: any = {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password
  };
  
  // Add referral_code if provided (optional field)
  if (data.referral_code && data.referral_code.trim()) {
    cleanData.referral_code = data.referral_code.trim();
  }
  
  // Add address if provided
  if (data.address && data.address.trim()) {
    cleanData.address = data.address.trim();
  }
  
  // Add date_of_birth if provided
  if (data.date_of_birth) {
    cleanData.date_of_birth = data.date_of_birth;
  }
  
  // Validate required fields
  if (!cleanData.name || !cleanData.email || !cleanData.password) {
    throw new Error('All required fields must be filled for student registration');
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
    onSuccess: (data, variables) => {
      // Store token in localStorage if available (client-side only)
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        
        // Construct user object from API response or use registration data
        const userData = data.user || {
          id: data.user?.id || 0,
          name: data.user?.name || variables.name,
          email: data.user?.email || variables.email,
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also set cookie for middleware
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = `token=${data.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        
        // Dispatch custom event to notify header of user update
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: userData }));
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
    onSuccess: (data, variables) => {
      // Store token in localStorage if available (client-side only)
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        
        // Construct user object from API response or use registration data
        const userData = data.user || {
          id: data.user?.id || 0,
          name: data.user?.name || variables.name,
          email: data.user?.email || variables.email,
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also set cookie for middleware
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = `token=${data.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        
        // Dispatch custom event to notify header of user update
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: userData }));
      }
    },
    onError: (error) => {
      console.error('Student registration error:', error);
    },
  });
};

