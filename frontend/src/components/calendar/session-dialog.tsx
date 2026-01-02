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
  DialogTitle,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { daysOfWeek, sessionStatuses } from "../../lib/types";
import type { Session, DayOfWeek, User, Availability } from "../../lib/types";
import { cn } from "../../lib/utils";
import { createSession, updateSessionApi } from "../../api/sessions";
import SessionDialogFields from "./SessionDialogFields";
import { Button } from "../ui/button";
import { Calendar, Clock } from "lucide-react";

const statusBadgeClasses: { [key: string]: string } = {
  Scheduled: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Absent: "bg-amber-100 text-amber-700 border-amber-200",
};

const formSchema = z.object({
  trainerId: z.string().min(1, "Trainer is required."),
  batch: z.string().min(1, "Batch name is required."),
  sessionType: z.string().min(1, "Session Name/ Type is required."),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
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

  const selectedTrainerId = form.watch("trainerId");
  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");
  const selectedDuration = form.watch("duration");

  const availability = useMemo(() => {
    if (!selectedTrainerId || !selectedDate) return null;
    const dayOfWeek: DayOfWeek = daysOfWeek[selectedDate.getDay()];
    return (
    normalizedAvailabilities.find(
      (a) =>
        String(a.trainerId) === String(selectedTrainerId) &&
        a.day === dayOfWeek
    ) ?? null
    );
  }, [selectedTrainerId, selectedDate, normalizedAvailabilities]);

  const conflict = useMemo(() => {
    if (!selectedTrainerId || !selectedDate || !selectedTime || !selectedDuration) return null;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const proposedStart = new Date(selectedDate);
    proposedStart.setHours(hours, minutes, 0, 0);
    const proposedEnd = new Date(proposedStart.getTime() + selectedDuration * 60000);

    return (
      normalizedSessions.find((s) => {
        if (String(s.trainerId) !== String(selectedTrainerId)) return false;
        if (session && s.id === session.id) return false;

        const existingStart = s.date instanceof Date ? s.date : new Date(s.date);
        const existingEnd = new Date(existingStart.getTime() + s.duration * 60000);

        return proposedStart < existingEnd && proposedEnd > existingStart;
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
    const trainer = trainers.find((t) => String(t.id) === String(conflict.trainerId));
    return trainer?.name || "Unknown";
  };

  useEffect(() => {
    if (isOpen) {
      if (session) {
        const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
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
          sessionType: "",
          trainerId:
            currentTrainer?.id?.toString() || (trainers[0]?.id?.toString() ?? ""),
          location: "Main Gym",
          notes: "",
          status: "Scheduled",
          isRecurring: false,
          recurrenceWeeks: 4,
        });
      }
    }
  }, [session, isOpen, form, currentTrainer, trainers]);

  const canSubmit = !!availability && !conflict && !isSubmitting;

  const onSubmit: SubmitHandler<SessionFormValues> = async (values) => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const [hours, minutes] = values.time.split(":").map(Number);

      if (session) {
        const sessionDate = new Date(values.date);
        sessionDate.setHours(hours, minutes, 0, 0);
        await updateSessionApi(session.id, {
          trainerId: String(values.trainerId),
          batch: values.batch,
          sessionType: values.sessionType,
          date: sessionDate.toISOString(),
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
          date: sessionDate,
          duration: values.duration,
          location: values.location,
          notes: values.notes,
          status: values.status,
        };
        onSessionSave([updatedSession]);
      } else {
        const sessionsCreated: Session[] = [];
        const repeatCount = values.isRecurring ? values.recurrenceWeeks || 1 : 1;
        for (let i = 0; i < repeatCount; i++) {
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
            status: "Scheduled",
          });
          sessionsCreated.push({
            id: result.id,
            trainerId: result.trainerId,
            batch: result.batch,
            sessionType: result.sessionType,
            date: new Date(result.date),
            duration: result.duration,
            location: result.location,
            notes: result.notes,
            status: "Scheduled",
          });
        }
        onSessionSave(sessionsCreated);
      }
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl bg-slate-50 border-slate-200 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-white border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {session ? (
                   <>
                     <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                        <Calendar className="h-5 w-5" />
                     </div>
                     Edit Session
                   </>
                ) : (
                   <>
                     <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                        <Calendar className="h-5 w-5" />
                     </div>
                     Schedule Session
                   </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-500 ml-9">
                {session ? "Modify the details below." : "Enter session details below."}
              </DialogDescription>
            </div>
            {session && (
              <Badge className={cn("capitalize px-3 py-1 font-medium shadow-sm", statusBadgeClasses[session.status])}>
                {session.status}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[65vh]">
                
                 {/* Top Section: Trainer Selector (if creating as admin) */}
                {!currentTrainer && (
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 block">Trainer Assignment</label>
                     <select
                      {...form.register("trainerId")}
                      className="w-full rounded-lg border-slate-200 bg-white px-3 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
                      disabled={!!session}
                    >
                      <option value="">Select a trainer...</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {currentTrainer && (
                   <input type="hidden" {...form.register("trainerId")} value={currentTrainer.id} />
                )}

                <Separator className="bg-slate-200" />
                
                {/* Main Content: Split into logical sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Timing */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm uppercase tracking-wider">
                            <Clock className="w-4 h-4" /> Timing
                        </div>
                        {/* We use the SessionDialogFields but wrapped or styled if possible. 
                            Since SessionDialogFields renders simple FormItems, we rely on its internal structure but we can style around it.
                            We might need to refactor SessionDialogFields if we want granulary control, but for now we inject it here.
                         */}
                         {/* To achieve the "Wizard" look without rewriting SessionDialogFields entirely, we rely on the component. 
                             Ideally, we should break SessionDialogFields into pieces, but for this "Polish" task, we will wrap it nicely.
                             Actually, looking at SessionDialogFields (assumed content), it likely dumps all fields. 
                             Let's continue using it but verify if it needs styling overrides. 
                             For now, we place it here.
                          */}
                         <div className="col-span-1 md:col-span-2">
                            <SessionDialogFields
                              form={form}
                              conflict={conflict}
                              getConflictingTrainerName={getConflictingTrainerName}
                              availability={availability}
                              session={session}
                            />
                         </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-6 pt-4 bg-white border-t border-slate-100 flex-col sm:flex-row gap-3 sm:gap-0">
               <div className="flex-1 text-xs text-slate-400 font-medium flex items-center">
                  {canSubmit ? (
                     <span className="text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ready to save
                     </span>
                  ) : (
                     <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        Complete all required fields
                     </span>
                  )}
               </div>
              <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!canSubmit}
                    className={cn(
                        "flex-1 sm:flex-none font-bold transition-all shadow-sm hover:shadow-md",
                        canSubmit ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 text-slate-400"
                    )}
                  >
                    {isSubmitting ? "Saving..." : session ? "Save Changes" : "Create Session"}
                  </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
