// TEMPORARILY DISABLED: The /api/me endpoint is currently unavailable.
// This file preserves the UserProfile types but returns a stubbed hook
// so that dependent components can safely import without triggering fetches.

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
  role?: string;
  title?: string;
  teacher_level?: string;
}

export interface UseMeResult {
  data: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export const useMe = (): UseMeResult => {
  console.warn('useMe hook is currently disabled because /api/me is unavailable.');
  return {
    data: null,
    isLoading: false,
    error: new Error('Profile API is currently disabled.'),
  };
};

