// src/components/calendar/session-dialog.tsx

import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { Badge } from "../ui/badge";
import { sessionTypes, sessionStatuses } from "../../lib/types";
import type { Session, DayOfWeek, User, Availability } from "../../lib/types";
import { cn } from "../../lib/utils";
import { createSession, updateSessionApi } from "../../api/sessions";
import SessionDialogFields from "./SessionDialogFields";
import { Button } from "../ui/button";

// --- Status badge color classes ---
const statusBadgeClasses: { [key: string]: string } = {
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Absent: "bg-amber-100 text-amber-800",
};

// --- Type-safe form schema and values ---
const formSchema = z.object({
  trainerId: z.string().min(1, "Trainer is required."),
  batch: z.string().min(1, "Batch name is required."),
  sessionType: z.enum(sessionTypes),
  date: z.date({ required_error: "A date is required." }),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  duration: z.coerce.number().int().positive("Duration must be a positive number."),
  location: z.string().min(2, "Location is required."),
  notes: z.string().optional(),
  status: z.enum(sessionStatuses),
  isRecurring: z.boolean(),
  recurrenceWeeks: z.coerce.number().min(1).max(12).optional(),
});
export type SessionFormValues = z.infer<typeof formSchema>;

export interface SessionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session?: Session | null;
  onSessionSave: (sessions: Session[]) => void;
  sessions: Session[];
  trainers: User[];
  availabilities: Availability[];
  currentTrainer?: User;
}

export function SessionDialog({
  isOpen,
  setIsOpen,
  session,
  onSessionSave,
  sessions,
  trainers,
  availabilities,
  currentTrainer,
}: SessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedAvailabilities = useMemo(
    () =>
      availabilities.map((a) => ({
        ...a,
        trainerId: String((a as any).trainerId ?? (a as any).trainer),
      })),
    [availabilities]
  );
  const normalizedSessions = useMemo(
    () =>
      sessions.map((s) => ({
        ...s,
        trainerId: String((s as any).trainerId ?? (s as any).trainer),
      })),
    [sessions]
  );

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batch: "",
      duration: 60,
      location: "Main Gym",
      notes: "",
      status: "Scheduled",
      isRecurring: false,
    },
  });

  // Watch values
  const selectedTrainerId = form.watch("trainerId");
  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");
  const selectedDuration = form.watch("duration");

  // Find availability for selected trainer and day
  const availability = useMemo(() => {
    if (!selectedTrainerId || !selectedDate) return null;
    const dayOfWeek = format(selectedDate, "eeee") as DayOfWeek;
    return (
      normalizedAvailabilities.find(
        (a: Availability) =>
          String(a.trainerId) === String(selectedTrainerId) && a.day === dayOfWeek
      ) ?? null
    );
  }, [selectedTrainerId, selectedDate, normalizedAvailabilities]);

  // Find scheduling conflict
  const conflict = useMemo(() => {
    if (!selectedTrainerId || !selectedDate || !selectedTime || !selectedDuration) return null;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const proposedStartTime = new Date(selectedDate);
    proposedStartTime.setHours(hours, minutes, 0, 0);
    const proposedEndTime = new Date(proposedStartTime.getTime() + selectedDuration * 60000);

    return (
      normalizedSessions.find((s) => {
        if (String(s.trainerId) !== String(selectedTrainerId)) return false;
        if (session && s.id === session.id) return false;
        const existingStartTime = s.date instanceof Date ? s.date : new Date(s.date);
        const existingEndTime = new Date(existingStartTime.getTime() + s.duration * 60000);
        return proposedStartTime < existingEndTime && proposedEndTime > existingStartTime;
      }) ?? null
    );
  }, [
    selectedTrainerId,
    selectedDate,
    selectedTime,
    selectedDuration,
    normalizedSessions,
    session,
  ]);

  const getConflictingTrainerName = () => {
    if (!conflict) return "";
    const trainer = trainers.find((t: User) => String(t.id) === String(conflict.trainerId));
    return trainer?.name || "Unknown";
  };

  useEffect(() => {
    if (isOpen) {
      if (session) {
        const sessionDate: Date =
          session.date instanceof Date ? session.date : new Date(session.date);
        form.reset({
          trainerId: String(session.trainerId),
          batch: session.batch,
          sessionType: session.sessionType,
          date: sessionDate,
          time: format(sessionDate, "HH:mm"),
          duration: session.duration,
          location: session.location,
          notes: session.notes || "",
          status: session.status,
          isRecurring: false,
        });
      } else {
        form.reset({
          batch: "",
          duration: 60,
          date: new Date(),
          time: "09:00",
          sessionType: "Strength",
          trainerId:
            currentTrainer
              ? String(currentTrainer.id)
              : trainers.length > 0
              ? String(trainers[0].id)
              : "",
          location: "Main Gym",
          notes: "",
          status: "Scheduled",
          isRecurring: false,
          recurrenceWeeks: 4,
        });
      }
    }
    // eslint-disable-next-line
  }, [session, isOpen, form, currentTrainer, trainers]);

  // --- ENFORCE: Only allow submit if there is availability and no conflict ---
  const canSubmit = !!availability && !conflict && !isSubmitting;

  const onSubmit: SubmitHandler<SessionFormValues> = async (values) => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const [hours, minutes] = values.time.split(":").map(Number);

      if (session) {
        const combinedDate = new Date(values.date);
        combinedDate.setHours(hours, minutes, 0, 0);
        await updateSessionApi(session.id, {
          trainerId: String(values.trainerId),
          batch: values.batch,
          sessionType: values.sessionType,
          date: combinedDate.toISOString(),
          duration: values.duration,
          location: values.location,
          notes: values.notes,
          status: values.status,
        });
        const updatedSession: Session = {
          id: session.id,
          trainerId: String(values.trainerId),
          batch: values.batch,
          sessionType: values.sessionType,
          date: combinedDate,
          duration: values.duration,
          location: values.location,
          notes: values.notes,
          status: values.status,
        };
        onSessionSave([updatedSession]);
      } else {
        const createdSessions: Session[] = [];
        const occurrences = values.isRecurring ? values.recurrenceWeeks || 1 : 1;

        for (let i = 0; i < occurrences; i++) {
          const sessionDate = new Date(values.date);
          sessionDate.setDate(sessionDate.getDate() + i * 7);
          sessionDate.setHours(hours, minutes, 0, 0);

          const result = await createSession({
            trainerId: String(values.trainerId),
            batch: values.batch,
            sessionType: values.sessionType,
            date: sessionDate.toISOString(),
            duration: values.duration,
            location: values.location,
            notes: values.notes,
            status: "Scheduled" as const,
          });

          createdSessions.push({
            id: result.id,
            trainerId: result.trainerId,
            batch: values.batch,
            sessionType: values.sessionType,
            date: new Date(result.date),
            duration: values.duration,
            location: values.location,
            notes: values.notes,
            status: "Scheduled",
          });
        }

        onSessionSave(createdSessions);
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving session:", error);
      // Optionally show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI starts here ---
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">
                {session ? "Edit Session" : "New Session"}
              </h2>
              <DialogDescription>
                {session
                  ? "Update the details for this session."
                  : "Schedule a new session for a client."}
              </DialogDescription>
            </div>
            {session && (
              <Badge className={cn("capitalize text-base", statusBadgeClasses[session.status])}>
                {session.status}
              </Badge>
            )}
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Trainer selection/name */}
            {currentTrainer ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Trainer</label>
                <div className="mt-1 px-3 py-2 bg-muted rounded border">{currentTrainer.name}</div>
                {/* Hidden input for form submission */}
                <input type="hidden" {...form.register("trainerId")} value={currentTrainer.id} />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Trainer</label>
                <select
                  {...form.register("trainerId")}
                  className="mt-1 block w-full rounded border px-3 py-2"
                  disabled={!!session} // prevent changing on edit, if desired
                >
                  <option value="">Select trainer</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
<SessionDialogFields
  form={form}
  conflict={conflict}
  getConflictingTrainerName={getConflictingTrainerName}
  availability={availability}
  session={session}
/>

            <DialogFooter className="pt-4 mt-4 border-t">
              <Button
                type="button"
                className="border border-border bg-background hover:bg-muted text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "Saving..." : "Save Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
