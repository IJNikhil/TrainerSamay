// src/components/calendar/SessionDialogFields.tsx

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  sessionTypes,
  sessionStatuses,
  type Session,
  type Availability,
} from "../../lib/types";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Switch } from "../ui/switch";
import { format } from "date-fns";
import { formatTimeString } from "../../lib/utils";

interface Props {
  form: any;
  conflict: Session | null;
  getConflictingTrainerName: () => string;
  availability: Availability | null;
  session?: Session | null;
}

export default function SessionDialogFields({
  form,
  conflict,
  getConflictingTrainerName,
  availability,
  session,
}: Props) {
  return (
    <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2">
      {/* Scheduling Conflict Alert */}
      {conflict && (
        <Alert className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-start gap-2 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div>
            <AlertTitle>Scheduling Conflict</AlertTitle>
            <AlertDescription>
              {getConflictingTrainerName()} already has a {conflict.sessionType} session for {conflict.batch} scheduled at{" "}
              {format(
                conflict.date instanceof Date
                  ? conflict.date
                  : new Date(conflict.date),
                "p"
              )}
              .
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Availability Info */}
      {availability && !conflict && (
        <div className="flex items-start text-sm p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
          <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span>
            Available on this day from {formatTimeString(availability.startTime)} to {formatTimeString(availability.endTime)}.
          </span>
        </div>
      )}

      {/* Warning if no availability */}
      {!availability && !conflict && (
        <div className="flex items-start text-sm p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span>
            You have not set your availability for this day. Please set your availability before scheduling a session.
          </span>
        </div>
      )}

      {/* Batch */}
      <FormField
        control={form.control}
        name="batch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Batch</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Morning Yoga Group" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <button
                      className="w-full pl-3 text-left font-normal bg-white dark:bg-gray-900 border rounded h-10 flex items-center"
                      type="button"
                    >
                      {field.value
                        ? format(field.value, "PPP")
                        : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>








      {/* Session Type & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sessionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (min)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>










      {/* Recurring Session (only for new sessions) */}
      {!session && (
        <>
          <Separator />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Weekly Recurring Session 
                    </FormLabel>
                    <span className="text-xs text-muted-foreground" style={{ paddingLeft: '0.5rem' }}>
                       Schedule this session for multiple weeks.
                    </span>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch("isRecurring") && (
              <FormField
                control={form.control}
                name="recurrenceWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of weeks to repeat</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </>
      )}









      <Separator />

      {/* Status */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sessionStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Main Gym, Studio B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
