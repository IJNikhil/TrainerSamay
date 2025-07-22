import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { daysOfWeek, type Availability, type DayOfWeek } from "../../lib/types";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const availabilitySchema = z.object({
  day: z.enum(daysOfWeek),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (e.g. 09:00)." }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (e.g. 17:00)." })
});

const formSchema = z.object({
  availabilities: z.array(availabilitySchema)
});

interface AvailabilityFormProps {
  trainerId: string;
  initialAvailabilities: Availability[];
  onUpdate: (availabilities: Availability[]) => void;
}

export default function AvailabilityForm({ trainerId, initialAvailabilities, onUpdate }: AvailabilityFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { availabilities: [] }
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "availabilities"
  });

  function normalizeTime(t: string) {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${(m || "00").padStart(2, "0")}`;
  }

  useEffect(() => {
    const sorted = [...initialAvailabilities]
      .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day))
      .map(a => ({
        ...a,
        startTime: normalizeTime(a.startTime),
        endTime: normalizeTime(a.endTime)
      }));
    replace(sorted);
    form.reset({ availabilities: sorted });
  }, [initialAvailabilities, replace, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const updatedData = data.availabilities.map(a => ({ ...a, trainerId }));
    onUpdate(updatedData);
  };

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    const currentAvailabilities = form.getValues().availabilities;
    let newAvailabilities;
    if (checked) {
      newAvailabilities = [...currentAvailabilities, { day, startTime: "09:00", endTime: "17:00" }];
    } else {
      newAvailabilities = currentAvailabilities.filter(a => a.day !== day);
    }
    newAvailabilities.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));
    replace(newAvailabilities);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Weekly Availability</CardTitle>
        <CardDescription>Toggle the days you are available and set your working hours.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {daysOfWeek.map(day => {
                const fieldIndex = fields.findIndex(f => f.day === day);
                const isEnabled = fieldIndex !== -1;

                return (
                  <motion.div
                    key={day}
                    layout
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      isEnabled ? "bg-muted/40 border-primary/20" : "bg-transparent"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Switch
                          id={`switch-${day}`}
                          checked={isEnabled}
                          onCheckedChange={(checked: boolean) => handleDayToggle(day, checked)}
                        />
                        <FormLabel htmlFor={`switch-${day}`} className="text-lg font-medium min-w-[100px]">
                          {day}
                        </FormLabel>
                      </div>

                      <AnimatePresence>
                        {isEnabled && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-4 sm:w-auto"
                          >
                            <FormField
                              control={form.control}
                              name={`availabilities.${fieldIndex}.startTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} className="bg-background w-full sm:w-[120px]" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`availabilities.${fieldIndex}.endTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} className="bg-background w-full sm:w-[120px]" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="h-12 px-6 text-lg"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                Update Availability
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
