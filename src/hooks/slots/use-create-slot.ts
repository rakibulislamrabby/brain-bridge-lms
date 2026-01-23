"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || "";

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith("/") ? path.slice(1) : path;
  if (!API_BASE_URL) {
    return `/${trimmedPath}`;
  }
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  return `${base}/${trimmedPath}`;
};

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

const getAuthHeaders = (
  isFormData: boolean = false,
): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export interface SlotTimeRange {
  start_time: string;
  end_time: string;
  meeting_link: string;
}

export interface DaySlot {
  slot_day: string;
  times: SlotTimeRange[];
}

export interface CreateSlotRequest {
  subject_id: number;
  title: string;
  from_date: string;
  to_date: string;
  slots: DaySlot[];
  type: string;
  price: number;
  max_students: number;
  description: string;
  video?: File | string | null;
}

export interface CreateSlotResponse {
  message?: string;
  [key: string]: unknown;
}

const buildSlotFormData = (
  payload: CreateSlotRequest,
  isUpdate: boolean = false,
): FormData => {
  const formData = new FormData();
  if (isUpdate) {
    formData.append("_method", "PUT");
  }

  formData.append("subject_id", payload.subject_id.toString());
  formData.append("title", payload.title);
  formData.append("from_date", payload.from_date);
  formData.append("to_date", payload.to_date);
  formData.append("type", payload.type);
  formData.append("price", payload.price.toString());
  formData.append("max_students", payload.max_students.toString());
  formData.append("description", payload.description || "");

  if (payload.video instanceof File) {
    formData.append("video", payload.video);
  } else if (typeof payload.video === "string") {
    formData.append("video", payload.video);
  }

  // Handle nested slots
  payload.slots.forEach((day, index) => {
    formData.append(`slots[${index}][slot_day]`, day.slot_day);
    day.times.forEach((time, tIndex) => {
      formData.append(
        `slots[${index}][times][${tIndex}][start_time]`,
        time.start_time,
      );
      formData.append(
        `slots[${index}][times][${tIndex}][end_time]`,
        time.end_time,
      );
      if (time.meeting_link) {
        formData.append(
          `slots[${index}][times][${tIndex}][meeting_link]`,
          time.meeting_link,
        );
      }
    });
  });

  return formData;
};

const createSlot = async (
  payload: CreateSlotRequest,
): Promise<CreateSlotResponse> => {
  const url = joinUrl("teacher/slots");
  const formData = buildSlotFormData(payload);
  const headers = getAuthHeaders(true);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        result?.error ||
        `Failed to create slot (${response.status})`;
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("Create slot error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to create slot");
  }
};

const updateSlot = async (
  id: number,
  payload: CreateSlotRequest,
): Promise<CreateSlotResponse> => {
  const url = joinUrl(`teacher/slots/${id}`);
  const formData = buildSlotFormData(payload, true);
  const headers = getAuthHeaders(true);

  try {
    const response = await fetch(url, {
      method: "POST", // Use POST with _method=PUT for FormData
      headers,
      body: formData,
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        result?.error ||
        `Failed to update slot (${response.status})`;
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("Update slot error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to update slot");
  }
};

export const useCreateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-slots"] });
    },
  });
};

export const useUpdateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateSlotRequest }) =>
      updateSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-slots"] });
    },
  });
};
