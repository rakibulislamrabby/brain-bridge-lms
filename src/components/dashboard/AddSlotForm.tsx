"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useSubjects } from "@/hooks/subject/use-subject";
import { useCreateSlot, useUpdateSlot } from "@/hooks/slots/use-create-slot";
import {
  Loader2,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  ClipboardList,
  Link as LinkIcon,
  Video,
  FileVideo,
} from "lucide-react";
import { TeacherSlot } from "@/hooks/slots/teacher/use-teacher-slot";

interface SlotTimeForm {
  start_time: string;
  end_time: string;
  meeting_link: string;
}

interface DaySlotForm {
  slot_day: string;
  times: SlotTimeForm[];
}

const SLOT_TYPES = [
  { value: "one_to_one", label: "One-to-One" },
  { value: "group", label: "Group" },
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface AddSlotFormProps {
  slotId?: number;
  initialData?: TeacherSlot;
}

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const resolveMediaUrl = (path?: string | null) => {
  if (!path) {
    return null;
  }

  // If already a full URL, return as is
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!MEDIA_BASE_URL) {
    return null;
  }

  const base = MEDIA_BASE_URL.endsWith("/")
    ? MEDIA_BASE_URL
    : `${MEDIA_BASE_URL}/`;

  if (path.startsWith("videos/") || path.startsWith("/videos/")) {
    const cleanedPath = path.replace(/^\/?videos\//, "").replace(/^\/+/, "");
    return `${base}storage/videos/${cleanedPath}`;
  }

  const cleanedPath = path.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `${base}storage/${cleanedPath}`;
};

export default function AddSlotForm({
  slotId,
  initialData,
}: AddSlotFormProps = {}) {
  const { data: subjects = [] } = useSubjects();
  const { addToast } = useToast();
  const router = useRouter();
  const createSlotMutation = useCreateSlot();
  const updateSlotMutation = useUpdateSlot();
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const isEditMode = !!slotId && !!initialData;

  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({
        value: subject.id.toString(),
        label: subject.name,
      })),
    [subjects],
  );

  const [formData, setFormData] = useState({
    subject_id: "",
    title: "",
    from_date: "",
    to_date: "",
    type: "one_to_one",
    price: "",
    max_students: "1",
    description: "",
  });

  const [daySlots, setDaySlots] = useState<DaySlotForm[]>([
    {
      slot_day: "Sunday",
      times: [{ start_time: "", end_time: "", meeting_link: "" }],
    },
  ]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoFile(null);
    const resolvedVideoUrl = initialData?.video
      ? resolveMediaUrl(initialData.video) || initialData.video
      : null;
    setVideoPreview(resolvedVideoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Initialize form with slot data if in edit mode
  useEffect(() => {
    if (isEditMode && initialData && subjects.length > 0) {
      // Format date from ISO string to YYYY-MM-DD
      const formatDateForInput = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
      };

      // Format time safely and ensure consistent padding (06:00 instead of 6:00)
      const formatTimeForInput = (timeString?: string): string => {
        if (!timeString) return "";
        const parts = timeString.split(":");
        if (parts.length >= 2) {
          const hours = parts[0].padStart(2, "0");
          const minutes = parts[1].padStart(2, "0");
          return `${hours}:${minutes}`;
        }
        return timeString;
      };

      // Find the subject to check if it has base_pay
      const selectedSubject = subjects.find(
        (s) => s.id === initialData.subject_id,
      );
      const priceValue =
        selectedSubject?.base_pay !== null &&
        selectedSubject?.base_pay !== undefined
          ? selectedSubject.base_pay.toString()
          : initialData.price || "";

      setFormData({
        subject_id: initialData.subject_id.toString(),
        title: initialData.title || "",
        from_date: formatDateForInput(initialData.from_date),
        to_date: formatDateForInput(initialData.to_date),
        type: initialData.type || "one_to_one",
        price: priceValue,
        max_students: initialData.max_students?.toString() || "1",
        description: initialData.description || "",
      });

      if (initialData.video) {
        const resolvedVideoUrl =
          resolveMediaUrl(initialData.video) || initialData.video;
        setVideoPreview(resolvedVideoUrl);
      }

      if (initialData.slots && initialData.slots.length > 0) {
        setDaySlots(
          initialData.slots.map((day) => ({
            slot_day: day.slot_day,
            times: day.times.map((t) => ({
              start_time: formatTimeForInput(t.start_time),
              end_time: formatTimeForInput(t.end_time),
              meeting_link: t.meeting_link || "",
            })),
          })),
        );
      }
      setIsFormInitialized(true);
    } else if (!isEditMode) {
      setIsFormInitialized(true);
    }
  }, [isEditMode, initialData, subjects]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Auto-populate price from subject's base_pay when subject is selected
      if (name === "subject_id" && value) {
        const selectedSubject = subjects.find((s) => s.id.toString() === value);
        if (
          selectedSubject?.base_pay !== null &&
          selectedSubject?.base_pay !== undefined
        ) {
          updated.price = selectedSubject.base_pay.toString();
        }
      }

      return updated;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  // Check if price should be disabled (when no subject is selected or subject has base_pay)
  const isPriceDisabled = useMemo(() => {
    if (!formData.subject_id) return true; // Disable when no subject is selected
    const selectedSubject = subjects.find(
      (s) => s.id.toString() === formData.subject_id,
    );
    return (
      selectedSubject?.base_pay !== null &&
      selectedSubject?.base_pay !== undefined
    );
  }, [formData.subject_id, subjects]);

  const toggleHourSlot = (dayIndex: number, hour: number) => {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${((hour + 1) % 24).toString().padStart(2, "0")}:00`;

    setDaySlots((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        // Create a copy of times and filter out any completely empty initial slots
        let newTimes = day.times.filter(
          (t) => t.start_time !== "" || t.end_time !== "",
        );

        const existingIndex = newTimes.findIndex(
          (t) => t.start_time === startTime && t.end_time === endTime,
        );

        if (existingIndex > -1) {
          // If already exists, remove it (toggle OFF)
          newTimes = newTimes.filter((_, i) => i !== existingIndex);
        } else {
          // Otherwise, add it (toggle ON)
          newTimes.push({
            start_time: startTime,
            end_time: endTime,
            meeting_link: "",
          });
        }

        // Return new day object with sorted times for consistent UI
        return {
          ...day,
          times: newTimes.sort((a, b) =>
            a.start_time.localeCompare(b.start_time),
          ),
        };
      }),
    );
  };

  const isHourSelected = (dayIndex: number, hour: number) => {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${((hour + 1) % 24).toString().padStart(2, "0")}:00`;
    const day = daySlots[dayIndex];
    if (!day) return false;

    return day.times.some(
      (t) => t.start_time === startTime && t.end_time === endTime,
    );
  };

  const applyLinkToAllDaySlots = (dayIndex: number, link: string) => {
    setDaySlots((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex
          ? {
              ...day,
              times: day.times.map((t) => ({ ...t, meeting_link: link })),
            }
          : day,
      ),
    );
  };

  const copyScheduleToAllDays = (sourceDayIndex: number) => {
    const sourceSlots = daySlots[sourceDayIndex].times;
    setDaySlots((prev) =>
      prev.map((day, idx) =>
        idx === sourceDayIndex ? day : { ...day, times: [...sourceSlots] },
      ),
    );
    addToast({
      type: "success",
      title: "Schedule Copied",
      description: `Schedule from ${daySlots[sourceDayIndex].slot_day} applied to all days.`,
      duration: 3000,
    });
  };

  const handleDayChange = (dayIndex: number, value: string) => {
    setDaySlots((prev) => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], slot_day: value };
      return updated;
    });
  };

  const handleTimeChange = (
    dayIndex: number,
    timeIndex: number,
    field: keyof SlotTimeForm,
    value: string,
  ) => {
    setDaySlots((prev) => {
      const updated = [...prev];
      const updatedDay = { ...updated[dayIndex] };
      const updatedTimes = [...updatedDay.times];
      updatedTimes[timeIndex] = { ...updatedTimes[timeIndex], [field]: value };
      updatedDay.times = updatedTimes;
      updated[dayIndex] = updatedDay;
      return updated;
    });
  };

  const addDaySlot = () => {
    setDaySlots((prev) => [
      ...prev,
      {
        slot_day: "Sunday",
        times: [{ start_time: "", end_time: "", meeting_link: "" }],
      },
    ]);
  };

  const removeDaySlot = (index: number) => {
    setDaySlots((prev) => prev.filter((_, i) => i !== index));
  };

  const addTimeSlot = (dayIndex: number) => {
    setDaySlots((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        times: [
          ...updated[dayIndex].times,
          { start_time: "", end_time: "", meeting_link: "" },
        ],
      };
      return updated;
    });
  };

  const removeTimeSlot = (dayIndex: number, timeIndex: number) => {
    setDaySlots((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        times: updated[dayIndex].times.filter((_, i) => i !== timeIndex),
      };
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      subject_id: "",
      title: "",
      from_date: "",
      to_date: "",
      type: "one_to_one",
      price: "",
      max_students: "1",
      description: "",
    });
    setDaySlots([
      {
        slot_day: "Sunday",
        times: [{ start_time: "", end_time: "", meeting_link: "" }],
      },
    ]);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.subject_id ||
      !formData.title ||
      !formData.from_date ||
      !formData.to_date ||
      !formData.price
    ) {
      addToast({
        type: "error",
        title: "Required Information Missing",
        description:
          "Please fill in the subject, title, date range, and price to create your video call session.",
        duration: 5000,
      });
      return;
    }

    const hasInvalidDay = daySlots.some(
      (day) => !day.slot_day || day.times.length === 0,
    );
    if (hasInvalidDay) {
      addToast({
        type: "error",
        title: "Schedule Incomplete",
        description:
          "Please select a day and add at least one time slot for each day you want to offer sessions.",
        duration: 5000,
      });
      return;
    }

    const hasInvalidTime = daySlots.some((day) =>
      day.times.some((time) => !time.start_time || !time.end_time),
    );
    if (hasInvalidTime) {
      addToast({
        type: "error",
        title: "Time Slots Incomplete",
        description:
          "Please provide both start and end times for all time slots.",
        duration: 5000,
      });
      return;
    }

    const hasInvalidTimeRange = daySlots.some((day) =>
      day.times.some((time) => {
        const start = new Date(`1970-01-01T${time.start_time}`);
        const end = new Date(`1970-01-01T${time.end_time}`);
        return end <= start;
      }),
    );

    if (hasInvalidTimeRange) {
      addToast({
        type: "error",
        title: "Invalid Time Range",
        description:
          "The end time must be later than the start time for each session slot.",
        duration: 5000,
      });
      return;
    }

    // Format times to ensure they're in HH:MM format (as expected by API)
    const formatTime = (time: string): string => {
      if (!time) return time;
      // Remove seconds if present (convert HH:MM:SS to HH:MM)
      if (time.split(":").length === 3) {
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes}`;
      }
      // If already in HH:MM format, return as is
      return time;
    };

    // Ensure dates are in YYYY-MM-DD format (not datetime)
    const formatDate = (date: string): string => {
      if (!date) return date;
      // If date includes time, extract just the date part
      if (date.includes("T")) {
        return date.split("T")[0];
      }
      return date;
    };

    const payload: any = {
      subject_id: Number(formData.subject_id),
      title: formData.title,
      from_date: formatDate(formData.from_date),
      to_date: formatDate(formData.to_date),
      type: formData.type,
      price: Number(formData.price),
      max_students: Number(formData.max_students),
      description: formData.description,
      slots: daySlots.map((day) => ({
        slot_day: (day.slot_day || "Sunday").trim(),
        times: day.times.map((slot) => ({
          start_time: formatTime(slot.start_time),
          end_time: formatTime(slot.end_time),
          meeting_link: slot.meeting_link || "",
        })),
      })),
    };

    if (videoFile instanceof File) {
      payload.video = videoFile;
    } else if (initialData?.video) {
      payload.video = initialData.video;
    }

    try {
      if (isEditMode && slotId) {
        const result = await updateSlotMutation.mutateAsync({
          id: slotId,
          payload,
        });
        addToast({
          type: "success",
          title: "Video Call Session Updated!",
          description:
            result?.message ||
            "Your video call session has been updated successfully.",
          duration: 5000,
        });
        router.push("/dashboard/one-to-one-session");
      } else {
        const result = await createSlotMutation.mutateAsync(payload);
        addToast({
          type: "success",
          title: "Video Call Session Created!",
          description:
            result?.message ||
            "Your video call session is now available for students to book.",
          duration: 5000,
        });
        resetForm();
      }
    } catch (error) {
      let errorMessage = isEditMode
        ? "We couldn't update your video call session. Please check your information and try again."
        : "We couldn't create your video call session. Please check your information and try again.";

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();

        // Handle common API errors with user-friendly messages
        if (errorText.includes("network") || errorText.includes("fetch")) {
          errorMessage =
            "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (
          errorText.includes("unauthorized") ||
          errorText.includes("unauthenticated")
        ) {
          errorMessage =
            "Your session has expired. Please sign in again and try again.";
        } else if (
          errorText.includes("end_time") &&
          errorText.includes("start_time")
        ) {
          errorMessage =
            "The end time must be after the start time for all time slots. Please check your schedule.";
        } else if (
          errorText.includes("validation") ||
          errorText.includes("invalid")
        ) {
          errorMessage =
            "Some information provided is invalid. Please review your session details and try again.";
        } else if (
          errorText.includes("file") ||
          errorText.includes("upload") ||
          errorText.includes("video")
        ) {
          errorMessage =
            "There was an issue uploading your video. Please ensure the file is in MP4, WebM, or Ogg format and under 50MB.";
        } else if (errorText.includes("date") || errorText.includes("time")) {
          errorMessage =
            "Please check your dates and times. Make sure the end date is after the start date.";
        }
      }

      addToast({
        type: "error",
        title: isEditMode
          ? "Could Not Update Session"
          : "Could Not Create Session",
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  // Show loading state while form is initializing in edit mode
  if (isEditMode && !isFormInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-gray-400">Loading slot details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isEditMode ? "Edit Live Session" : "Add Video Call"}
        </h1>
        <p className="text-gray-400 mt-2">
          {isEditMode
            ? "Update the availability windows, pricing, and time slots for your live class."
            : "Configure availability windows, pricing, and time slots for your live class."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <CalendarIcon className="h-5 w-5 text-orange-500" />
              Slot Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Define the timing, availability, and pricing for your one-to-one
              session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="subject_id"
                  className="text-sm font-medium text-gray-300"
                >
                  Subject <span className="text-red-400">*</span>
                </Label>
                <select
                  id="subject_id"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  required
                  className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-300"
                >
                  Session Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Live Math Class"
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="from_date"
                  className="text-sm font-medium text-gray-300"
                >
                  Available From <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="from_date"
                  name="from_date"
                  type="date"
                  value={formData.from_date}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="to_date"
                  className="text-sm font-medium text-gray-300"
                >
                  Available To <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="to_date"
                  name="to_date"
                  type="date"
                  value={formData.to_date}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Type
                </Label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                >
                  {SLOT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Price <span className="text-red-400">*</span>
                  {isPriceDisabled && formData.subject_id && (
                    <span className="text-xs text-gray-400 ml-2">
                      (from subject base pay)
                    </span>
                  )}
                </Label>
                <div
                  className={`mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white ${isPriceDisabled ? "opacity-75" : ""}`}
                >
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="150"
                    disabled={isPriceDisabled}
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
                  />
                </div>
                {isPriceDisabled && !formData.subject_id && (
                  <p className="text-xs text-gray-400 mt-1">
                    Please select a subject first
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Max Students
                </Label>
                <div className="mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                  <Users className="h-4 w-4 text-purple-400" />
                  <Input
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-300"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this session covers"
                className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500 min-h-[100px]"
              />
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Video className="h-4 w-4 text-orange-400" />
                Intro Video
              </Label>
              <div className="mt-3 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div
                    className="relative group border-2 border-dashed border-gray-600 rounded-xl p-8 transition-all hover:border-orange-500/50 hover:bg-gray-700/30 text-center cursor-pointer"
                    onClick={() =>
                      document.getElementById("video-upload")?.click()
                    }
                  >
                    <input
                      id="video-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileVideo className="h-6 w-6 text-gray-400 group-hover:text-orange-400" />
                      </div>
                      <p className="text-sm text-gray-300 font-medium">
                        {videoPreview
                          ? "Change intro video"
                          : "Click to upload intro video"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MP4, WebM or Ogg (Max 50MB)
                      </p>
                    </div>
                  </div>
                </div>

                {videoPreview && (
                  <div className="w-full md:w-64 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex justify-between">
                      {videoFile ? "New Video" : "Current Video"}
                      {videoFile && (
                        <button
                          onClick={handleRemoveVideo}
                          className="text-red-400 hover:text-red-300 text-[10px]"
                        >
                          Reset
                        </button>
                      )}
                    </p>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-600 flex items-center justify-center">
                      <video
                        key={videoPreview}
                        src={videoPreview}
                        className="w-full h-full object-contain"
                        controls
                      />
                    </div>
                    {videoFile && (
                      <p className="text-[10px] text-orange-400 truncate font-medium">
                        {videoFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slot times */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Clock className="h-5 w-5 text-orange-500" />
              Time Slots
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add one or more sessions for the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daySlots.map((daySlot, dayIndex) => (
              <div
                key={dayIndex}
                className="border border-gray-700 rounded-lg p-6 bg-gray-900/40 space-y-6 relative group/card"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 max-w-[200px]">
                    <Label className="text-sm font-medium text-gray-300">
                      Day of Week <span className="text-red-400">*</span>
                    </Label>
                    <select
                      value={daySlot.slot_day}
                      onChange={(e) =>
                        handleDayChange(dayIndex, e.target.value)
                      }
                      className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyScheduleToAllDays(dayIndex)}
                      className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Apply to All Days
                    </Button>
                    {daySlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDaySlot(dayIndex)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Day
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      Select Hour Blocks
                    </Label>
                    <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-1.5 px-2 py-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          Selected
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 border-l border-gray-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Time Grid - Divided by Morning/Afternoon/Evening */}
                    {[
                      {
                        label: "Morning (06:00 - 12:00)",
                        hours: [6, 7, 8, 9, 10, 11],
                      },
                      {
                        label: "Afternoon (12:00 - 18:00)",
                        hours: [12, 13, 14, 15, 16, 17],
                      },
                      {
                        label: "Evening (18:00 - 00:00)",
                        hours: [18, 19, 20, 21, 22, 23],
                      },
                    ].map((group) => (
                      <div key={group.label}>
                        <p className="text-[11px] text-gray-500 uppercase font-bold mb-2 ml-1">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {group.hours.map((hour) => {
                            const selected = isHourSelected(dayIndex, hour);
                            return (
                              <button
                                key={hour}
                                type="button"
                                onClick={() => toggleHourSlot(dayIndex, hour)}
                                className={`py-2 px-1 rounded-lg text-[11px] font-bold border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                                  selected
                                    ? "bg-orange-600 border-orange-500 text-white shadow-sm z-10"
                                    : "bg-gray-800/40 border-gray-700/50 text-gray-500 hover:border-gray-600 hover:bg-gray-700/30"
                                }`}
                              >
                                <span>
                                  {hour.toString().padStart(2, "0")}:00
                                </span>
                                <span
                                  className={`text-[8px] opacity-70 font-medium ${selected ? "text-orange-100" : "text-gray-600"}`}
                                >
                                  -{" "}
                                  {((hour + 1) % 24)
                                    .toString()
                                    .padStart(2, "0")}
                                  :00
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {daySlot.times.length > 0 && (
                    <div className="space-y-4 mt-8 animate-in fade-in duration-500">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                        <Label className="text-sm font-medium text-white flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-orange-400" />
                          Link Session Details ({daySlot.times.length} Slots)
                        </Label>
                        <div className="flex items-center gap-2 max-w-sm w-full">
                          <Input
                            placeholder="Common link for all slots today..."
                            className="h-8 text-xs bg-gray-800/50 border-gray-700"
                            onBlur={(e) => {
                              if (e.target.value) {
                                applyLinkToAllDaySlots(
                                  dayIndex,
                                  e.target.value,
                                );
                              }
                            }}
                          />
                          <p className="text-[10px] text-gray-500 whitespace-nowrap">
                            (Press tab to apply)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                        {daySlot.times.map((timeSlot, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50 flex flex-col lg:flex-row lg:items-center gap-3"
                          >
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Clock className="h-3.5 w-3.5 text-orange-500" />
                              </div>
                              <span className="text-sm font-bold text-white uppercase tracking-tight">
                                {timeSlot.start_time} - {timeSlot.end_time}
                              </span>
                            </div>

                            <div className="flex-1 relative group/link">
                              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                              <Input
                                type="url"
                                value={timeSlot.meeting_link}
                                onChange={(e) =>
                                  handleTimeChange(
                                    dayIndex,
                                    timeIndex,
                                    "meeting_link",
                                    e.target.value,
                                  )
                                }
                                placeholder="Meeting Link (e.g. Zoom, G-Meet)"
                                className="pl-9 h-9 bg-gray-700/50 border-gray-600 text-sm focus:border-orange-500 transition-colors"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                  <Label className="text-gray-400">From</Label>
                                  <Input
                                    type="time"
                                    value={timeSlot.start_time}
                                    onChange={(e) =>
                                      handleTimeChange(
                                        dayIndex,
                                        timeIndex,
                                        "start_time",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 w-24 bg-gray-700/30 border-0 p-1 text-center"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-gray-400">To</Label>
                                  <Input
                                    type="time"
                                    value={timeSlot.end_time}
                                    onChange={(e) =>
                                      handleTimeChange(
                                        dayIndex,
                                        timeIndex,
                                        "end_time",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 w-24 bg-gray-700/30 border-0 p-1 text-center"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeTimeSlot(dayIndex, timeIndex)
                                }
                                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addTimeSlot(dayIndex)}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 w-full border border-dashed border-orange-900/10"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Custom Interval
                      </Button>
                    </div>
                  )}

                  {daySlot.times.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-gray-800 rounded-xl text-center">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                      <p className="text-gray-500">
                        No slots selected. Click the hour blocks above to add
                        availability.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addDaySlot}
              className="w-full border-dashed border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-950/10 py-6"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Day to Schedule
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/one-to-one-session")}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              disabled={
                createSlotMutation.isPending || updateSlotMutation.isPending
              }
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              createSlotMutation.isPending || updateSlotMutation.isPending
            }
            className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
          >
            {createSlotMutation.isPending || updateSlotMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {isEditMode ? "Updating Slot..." : "Creating Slot..."}
              </>
            ) : isEditMode ? (
              "Update Slot"
            ) : (
              "Create Slot"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
