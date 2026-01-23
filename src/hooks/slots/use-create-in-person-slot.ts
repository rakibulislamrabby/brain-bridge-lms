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

  // Only set Content-Type for JSON, let browser set it for FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export interface InPersonSlotTimeRange {
  start_time: string;
  end_time: string;
}

export interface InPersonDaySlot {
  slot_day: string;
  times: InPersonSlotTimeRange[];
}

export interface CreateInPersonSlotRequest {
  title: string;
  subject_id: number;
  from_date: string;
  to_date: string;
  slots: InPersonDaySlot[];
  price: number;
  description: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  video?: File | string | null;
}

export interface InPersonSlotTime {
  id: number;
  in_person_slot_day_id: number;
  start_time: string;
  end_time: string;
  is_booked: number;
  created_at: string;
  updated_at: string;
}

export interface InPersonSlotDay {
  id: number;
  in_person_slot_id: number;
  day: string;
  created_at: string;
  updated_at: string;
  times: InPersonSlotTime[];
}

export interface InPersonSlotData {
  id: number;
  country: string;
  state: string;
  city: string;
  area: string;
  title: string;
  teacher_id: number;
  subject_id: number | string;
  from_date: string;
  to_date: string;
  price: number;
  description: string | null;
  video: string | null;
  created_at: string;
  updated_at: string;
  days: InPersonSlotDay[];
}

export interface CreateInPersonSlotResponse {
  success: boolean;
  message: string;
  data: InPersonSlotData;
}

export const buildInPersonSlotFormData = (
  payload: CreateInPersonSlotRequest,
  isUpdate: boolean = false,
): FormData => {
  const formData = new FormData();
  if (isUpdate) {
    formData.append("_method", "PUT");
  }

  formData.append("title", payload.title);
  formData.append("subject_id", payload.subject_id.toString());
  formData.append("from_date", payload.from_date);
  formData.append("to_date", payload.to_date);
  formData.append("price", payload.price.toString());
  formData.append("description", payload.description || "");

  if (payload.country) formData.append("country", payload.country);
  if (payload.state) formData.append("state", payload.state);
  if (payload.city) formData.append("city", payload.city);
  if (payload.area) formData.append("area", payload.area);

  // Only append video if it's a File (new upload)
  // For updates, if video is not a File, don't send it (backend preserves existing)
  if (payload.video instanceof File) {
    formData.append("video", payload.video);
  }
  // Note: We don't send video as string to avoid overwriting existing video on update

  payload.slots.forEach((day: InPersonDaySlot, index: number) => {
    formData.append(`slots[${index}][slot_day]`, day.slot_day);
    day.times.forEach((time: InPersonSlotTimeRange, tIndex: number) => {
      formData.append(
        `slots[${index}][times][${tIndex}][start_time]`,
        time.start_time,
      );
      formData.append(
        `slots[${index}][times][${tIndex}][end_time]`,
        time.end_time,
      );
    });
  });

  return formData;
};

const createInPersonSlot = async (
  payload: CreateInPersonSlotRequest,
): Promise<CreateInPersonSlotResponse> => {
  const url = joinUrl("teacher/in-person-slots");
  const formData = buildInPersonSlotFormData(payload);
  const headers = getAuthHeaders(true);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const text = await response.text();
    let result: CreateInPersonSlotResponse | any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      throw new Error("Invalid response format from server");
    }

    if (!response.ok) {
      if (result?.errors && typeof result.errors === "object") {
        const errorMessages = Object.entries(result.errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(", ")}`;
          })
          .join("; ");
        throw new Error(errorMessages || "Validation failed");
      }

      const errorMessage =
        result?.message ||
        result?.error ||
        `Failed to create in-person slot (${response.status})`;
      throw new Error(errorMessage);
    }

    if (!result.success) {
      throw new Error(result?.message || "Slot creation failed");
    }

    return result as CreateInPersonSlotResponse;
  } catch (error) {
    console.error("Create in-person slot error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to create in-person slot");
  }
};

export const useCreateInPersonSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInPersonSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-slots"] });
      queryClient.invalidateQueries({ queryKey: ["in-person-slots"] });
    },
  });
};
