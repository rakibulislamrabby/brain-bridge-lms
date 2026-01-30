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
import { useUpdateInPersonSlot } from "@/hooks/slots/use-update-in-person-slot";
import { useTeacherInPersonSlotDetail } from "@/hooks/slots/use-teacher-in-person-slot-detail";
import {
  Loader2,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  ClipboardList,
  MapPin,
  Video,
  FileVideo,
  Save,
} from "lucide-react";

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

interface SlotTimeForm {
  start_time: string;
  end_time: string;
  id?: number;
}

interface DaySlotForm {
  slot_day: string;
  times: SlotTimeForm[];
  id?: number;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface EditInPersonSlotFormProps {
  slotId: number;
}

export default function EditInPersonSlotForm({
  slotId,
}: EditInPersonSlotFormProps) {
  const { data: subjects = [] } = useSubjects();
  const { addToast } = useToast();
  const router = useRouter();
  const updateSlotMutation = useUpdateInPersonSlot();

  // Fetch slot data using GET API: teacher/in-person-slots/{id}
  const {
    data: slotData,
    isLoading: isLoadingSlot,
    error: slotError,
  } = useTeacherInPersonSlotDetail(slotId);

  const [isFormInitialized, setIsFormInitialized] = useState(false);

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
    price: "",
    description: "",
    country: "",
    state: "",
    city: "",
    area: "",
  });

  const [daySlots, setDaySlots] = useState<DaySlotForm[]>([
    { slot_day: "Sunday", times: [{ start_time: "", end_time: "" }] },
  ]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with slot data from GET API
  useEffect(() => {
    if (slotData && subjects.length > 0) {
      // Format date from ISO string to YYYY-MM-DD
      const formatDateForInput = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
      };

      // Format time from HH:MM:SS to HH:MM
      const formatTimeForInput = (timeString?: string): string => {
        if (!timeString) return "";
        if (timeString.split(":").length === 3) {
          const [hours, minutes] = timeString.split(":");
          return `${hours}:${minutes}`;
        }
        return timeString;
      };

      // Find the subject to check if it has base_pay
      const selectedSubject = subjects.find(
        (s) => s.id === slotData.subject_id,
      );
      const priceValue =
        selectedSubject?.base_pay !== null &&
        selectedSubject?.base_pay !== undefined
          ? selectedSubject.base_pay.toString()
          : slotData.price || "";

      // Set form data
      setFormData({
        subject_id: slotData.subject_id.toString(),
        title: slotData.title || "",
        from_date: formatDateForInput(slotData.from_date),
        to_date: formatDateForInput(slotData.to_date),
        price: priceValue,
        description: slotData.description || "",
        country: slotData.country || "",
        state: slotData.state || "",
        city: slotData.city || "",
        area: slotData.area || "",
      });

      // Initialize day slots with all days and times from GET API (keep ids for update)
      if (slotData.days && slotData.days.length > 0) {
        const mappedDaySlots = slotData.days.map((day) => {
          const dayTimes =
            day.times && day.times.length > 0
              ? day.times.map((t) => ({
                  start_time: formatTimeForInput(t.start_time),
                  end_time: formatTimeForInput(t.end_time),
                  ...(t.id != null && { id: t.id }),
                }))
              : [{ start_time: "", end_time: "" }];

          return {
            slot_day: day.day || "Sunday",
            times: dayTimes,
            ...(day.id != null && { id: day.id }),
          };
        });

        setDaySlots(mappedDaySlots);
      } else {
        // Fallback: if no days array, check for legacy flat start_time/end_time
        const raw = slotData as { start_time?: string; end_time?: string };
        if (raw.start_time && raw.end_time) {
          setDaySlots([
            {
              slot_day: "Sunday",
              times: [
                {
                  start_time: formatTimeForInput(raw.start_time),
                  end_time: formatTimeForInput(raw.end_time),
                },
              ],
            },
          ]);
        }
      }

      // Handle video preview
      if (slotData.video) {
        const resolvedVideoUrl =
          resolveMediaUrl(slotData.video) || slotData.video;
        setVideoPreview(resolvedVideoUrl);
      }

      setIsFormInitialized(true);
    }
  }, [slotData, subjects]);

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
        const selectedSubject = subjects.find(
          (s) => s.id.toString() === value,
        );
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

  // Check if price should be disabled (when subject has base_pay)
  const isPriceDisabled = useMemo(() => {
    if (!formData.subject_id) return false;
    const selectedSubject = subjects.find(
      (s) => s.id.toString() === formData.subject_id,
    );
    return (
      selectedSubject?.base_pay !== null &&
      selectedSubject?.base_pay !== undefined
    );
  }, [formData.subject_id, subjects]);

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
      { slot_day: "Sunday", times: [{ start_time: "", end_time: "" }] },
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
          { start_time: "", end_time: "" },
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

  const toggleHourSlot = (dayIndex: number, hour: number) => {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${((hour + 1) % 24).toString().padStart(2, "0")}:00`;

    setDaySlots((prev) =>
      prev.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        let newTimes = day.times.filter(
          (t) => t.start_time !== "" || t.end_time !== "",
        );

        const existingIndex = newTimes.findIndex(
          (t) => t.start_time === startTime && t.end_time === endTime,
        );

        if (existingIndex > -1) {
          newTimes = newTimes.filter((_, i) => i !== existingIndex);
        } else {
          newTimes.push({
            start_time: startTime,
            end_time: endTime,
          });
        }

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

  const copyScheduleToAllDays = (sourceDayIndex: number) => {
    const sourceSlots = daySlots[sourceDayIndex].times;
    // When copying to other days, strip ids so they are treated as new times
    const timesWithoutIds = sourceSlots.map((t) => ({
      start_time: t.start_time,
      end_time: t.end_time,
    }));
    setDaySlots((prev) =>
      prev.map((day, idx) =>
        idx === sourceDayIndex ? day : { ...day, times: timesWithoutIds },
      ),
    );
    addToast({
      type: "success",
      title: "Schedule Copied",
      description: `Schedule from ${daySlots[sourceDayIndex].slot_day} applied to all days.`,
      duration: 3000,
    });
  };

  const handleRemoveVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoFile(null);
    const resolvedVideoUrl = slotData?.video
      ? resolveMediaUrl(slotData.video) || slotData.video
      : null;
    setVideoPreview(resolvedVideoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (updateSlotMutation.isPending) return;

    // Validation
    if (
      !formData.subject_id ||
      !formData.title ||
      !formData.from_date ||
      !formData.to_date ||
      !formData.price
    ) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Subject, title, dates, and price are required.",
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
        title: "Invalid Schedule",
        description:
          "Each day must have a selected day and at least one time slot.",
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
        title: "Missing Slot Times",
        description: "Each slot must include both start and end times.",
        duration: 5000,
      });
      return;
    }

    // Parse time to minutes since midnight (handles HH:MM and HH:MM:SS reliably)
    const timeToMinutes = (timeStr: string): number => {
      if (!timeStr || typeof timeStr !== "string") return 0;
      const parts = timeStr.trim().split(":");
      const h = parseInt(parts[0] ?? "0", 10);
      const m = parseInt(parts[1] ?? "0", 10);
      if (Number.isNaN(h) || Number.isNaN(m)) return 0;
      return h * 60 + m;
    };

    const hasInvalidTimeRange = daySlots.some((day) =>
      day.times.some((time) => {
        const startM = timeToMinutes(time.start_time);
        const endM = timeToMinutes(time.end_time);
        return endM <= startM;
      }),
    );

    if (hasInvalidTimeRange) {
      addToast({
        type: "error",
        title: "Invalid Time Range",
        description: "End time must be after start time for each slot.",
        duration: 5000,
      });
      return;
    }

    // Ensure dates are in YYYY-MM-DD format
    const formatDate = (date: string): string => {
      if (!date) return date;
      const d = date.includes("T") ? date.split("T")[0] : date;
      return d.trim();
    };

    const fromDate = formatDate(formData.from_date);
    const toDate = formatDate(formData.to_date);
    if (fromDate && toDate && toDate < fromDate) {
      addToast({
        type: "error",
        title: "Invalid Date Range",
        description: "Available To date must be on or after Available From date.",
        duration: 5000,
      });
      return;
    }

    // Format times as HH:MM for API (backend expects end strictly after start)
    const formatTimeForApi = (time: string): string => {
      if (!time) return time;
      const parts = time.split(":");
      const hours = (parts[0] ?? "00").padStart(2, "0");
      const minutes = (parts[1] ?? "00").padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    const payload: any = {
      title: formData.title,
      subject_id: Number(formData.subject_id),
      from_date: fromDate,
      to_date: toDate,
      slots: daySlots
        .map((day) => {
          const validTimes = day.times
            .filter((slot) => slot.start_time && slot.end_time)
            .filter((slot) => timeToMinutes(slot.end_time) > timeToMinutes(slot.start_time))
            .map((slot) => ({
              start_time: formatTimeForApi(slot.start_time),
              end_time: formatTimeForApi(slot.end_time),
              ...(slot.id != null && { id: slot.id }),
            }));
          return {
            slot_day: (day.slot_day || "Sunday").trim(),
            ...(day.id != null && { id: day.id }),
            times: validTimes,
          };
        })
        .filter((day) => day.times.length > 0),
      price: Number(formData.price),
      description: formData.description,
      ...(formData.country && { country: formData.country }),
      ...(formData.state && { state: formData.state }),
      ...(formData.city && { city: formData.city }),
      ...(formData.area && { area: formData.area }),
    };

    // Handle video: only include if it's a new file
    if (videoFile instanceof File) {
      payload.video = videoFile;
    }

    try {
      const result = await updateSlotMutation.mutateAsync({
        id: slotId,
        payload,
      });

      addToast({
        type: "success",
        title: "In-Person Session Updated!",
        description: result?.message || "Your in-person session has been updated successfully.",
        duration: 6000,
      });

      router.push("/dashboard/in-person-session");
    } catch (error) {
      let errorMessage = "We couldn't update your in-person session. Please check your information and try again.";

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes("network") || errorText.includes("fetch")) {
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (errorText.includes("unauthorized") || errorText.includes("unauthenticated")) {
          errorMessage = "Your session has expired. Please sign in again and try again.";
        } else if (errorText.includes("end_time") && errorText.includes("start_time")) {
          errorMessage = "The end time must be after the start time for all time slots. Please check your schedule.";
        } else if (errorText.includes("validation") || errorText.includes("invalid")) {
          errorMessage = "Some information provided is invalid. Please review your session details and try again.";
        } else if (errorText.includes("video") || errorText.includes("file") || errorText.includes("upload")) {
          errorMessage = "There was an issue uploading your video. Please ensure the file is in MP4, WebM, or Ogg format and under 50MB.";
        } else if (errorText.includes("size") || errorText.includes("too large")) {
          errorMessage = "Your video file is too large. Please compress it or use a file under 50MB.";
        } else if (errorText.includes("format") || errorText.includes("type")) {
          errorMessage = "Your video file format is not supported. Please use MP4, WebM, or Ogg format.";
        } else if (errorText.includes("date") || errorText.includes("time")) {
          errorMessage = "Please check your dates and times. Make sure the end date is after the start date.";
        }
      }

      addToast({
        type: "error",
        title: "Could Not Update Session",
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  // Show loading state while fetching slot data
  if (isLoadingSlot || !isFormInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-gray-400">
            {isLoadingSlot
              ? "Loading slot details..."
              : "Initializing form..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (slotError || !slotData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">
          {slotError
            ? slotError instanceof Error
              ? slotError.message
              : "Failed to load slot"
            : "Slot not found"}
        </p>
        <Button
          onClick={() => router.push("/dashboard/in-person-session")}
          className="mt-4"
          variant="outline"
        >
          Back to Slots
        </Button>
      </div>
    );
  }

  const isSubmitting = updateSlotMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="relative">
        <h1 className="text-3xl font-bold text-white">
          Edit In-Person Session
          {isSubmitting && (
            <span className="ml-3 inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          )}
        </h1>
        <p className="text-gray-400 mt-2">
          Update the availability windows, pricing, and time slots for your
          in-person class.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={`border-0 p-0 m-0 space-y-6 min-w-0 transition-opacity duration-200 ${isSubmitting ? "opacity-75" : ""}`}
        >
          <legend className="sr-only">Edit in-person session</legend>
          {/* Slot Details */}
          <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <CalendarIcon className="h-5 w-5 text-orange-500" />
              Slot Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Define the timing, availability, and pricing for your in-person
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
                  placeholder="Graphics Design hands on class"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Price <span className="text-red-400">*</span>
                  {isPriceDisabled && (
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
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={isPriceDisabled}
                    className="flex-1 bg-transparent border-0 text-white focus:ring-0 focus:outline-none p-0"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-300 flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4 text-orange-400" />
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this session covers"
                rows={4}
                className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <MapPin className="h-5 w-5 text-orange-500" />
              Location Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Optional: Specify the location where the in-person session will
              take place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-300"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., USA"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="state"
                  className="text-sm font-medium text-gray-300"
                >
                  State/Province
                </Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., New York"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-300"
                >
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., New York City"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="area"
                  className="text-sm font-medium text-gray-300"
                >
                  Area/Neighborhood
                </Label>
                <Input
                  id="area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g., Manhattan, Downtown"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
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
                          type="button"
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

        {/* Time Slots - hour-based UI (same as Add In-Person Slot) */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Clock className="h-5 w-5 text-orange-500" />
              Time Slots
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select one or more 1-hour slots for the days you are available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                      className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 transition-colors duration-150 cursor-pointer"
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
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
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
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            Selected
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 border-l border-gray-700">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
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
                                  className={`py-2 px-1 rounded-lg text-[11px] font-bold border transition-all duration-200 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                                    selected
                                      ? "bg-orange-600 border-orange-500 text-white shadow-sm z-10 hover:bg-orange-500 hover:border-orange-400"
                                      : "bg-gray-800/40 border-gray-700/50 text-gray-500 hover:border-gray-600 hover:bg-gray-700/30 hover:text-gray-400"
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
                            Selected Intervals ({daySlot.times.length} Slots)
                          </Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                          {daySlot.times.map((timeSlot, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all duration-200 hover:border-gray-600/60"
                          >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                                </div>
                                <span className="text-sm font-bold text-white uppercase tracking-tight">
                                  {timeSlot.start_time} - {timeSlot.end_time}
                                </span>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-4 text-xs">
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
                                      className="h-8 w-24 bg-gray-700/30 border border-gray-600/50 rounded p-1 text-center text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50"
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
                                      className="h-8 w-24 bg-gray-700/30 border border-gray-600/50 rounded p-1 text-center text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50"
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
                                  className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
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
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 w-full border border-dashed border-orange-900/10 transition-colors duration-150 cursor-pointer"
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
              className="w-full border-dashed border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-950/10 py-6 transition-colors duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Day to Schedule
            </Button>
          </CardContent>
        </Card>

          {/* Submit Button */}
          <div className="flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/in-person-session")}
              className="border-gray-600 text-gray-400 hover:text-white disabled:opacity-70"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 disabled:opacity-90 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Slot
                </>
              )}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
