"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Ban,
  Users,
  AlertTriangle,
} from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "../../lib/utils";
import type { Session } from "../../lib/types";

interface CalendarViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

const MAX_VISIBLE_SESSIONS_PER_DAY = 2;

export function CalendarView({ sessions, onSessionClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[] | null>(null);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const startingDay = getDay(start);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <>
      <Card className="overflow-hidden border-2 border-border">
        <CardHeader className="flex items-center justify-between p-4 bg-muted/50 border-b-2 border-border">
          <h2 className="text-xl font-bold tracking-tight">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={goToToday} variant="outline">
              Today
            </Button>
            <Button onClick={prevMonth} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={nextMonth} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {days.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-muted-foreground text-sm py-3 border-b border-r border-border bg-muted/30"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}

            {Array.from({ length: startingDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border-b border-r border-border bg-muted/20 min-h-[120px]"
              />
            ))}

            {daysInMonth.map((day, index) => {
              const daySessions = sessions
                .filter((session) => isSameDay(new Date(session.date), day))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              const visibleSessions = daySessions.slice(0, MAX_VISIBLE_SESSIONS_PER_DAY);
              const overflowCount = daySessions.length - visibleSessions.length;

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative border-b border-r border-border p-1 sm:p-2 flex flex-col min-h-[120px] group transition",
                    (index + startingDay + 1) % 7 === 0 ? "border-r-0" : "",
                    isToday(day) ? "bg-primary/10" : "hover:bg-muted/40"
                  )}
                >
                  <time
                    className={cn(
                      "font-semibold text-sm flex items-center justify-center h-8 w-8 rounded-full mb-1",
                      isToday(day)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </time>

                  <div className="flex-grow space-y-1 mt-1 overflow-y-auto">
                    {visibleSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => onSessionClick(session)}
                        className={cn(
                          "w-full text-left p-1.5 rounded-md text-xs border-l-4 transition-all group/item relative border-border",
                          {
                            "bg-muted/60 text-foreground": session.status === "Scheduled",
                            "bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-200":
                              session.status === "Completed",
                            "bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 line-through":
                              session.status === "Cancelled",
                            "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200":
                              session.status === "Absent",
                          }
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold truncate pr-1">{session.sessionType}</p>
                          <div className="flex-shrink-0">
                            {session.status === "Started" && (
                              <CheckCircle className="h-3 w-3 text-yellow-500" />
                            )}
                            {session.status === "Completed" && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                            {session.status === "Cancelled" && (
                              <Ban className="h-3 w-3 text-red-600" />
                            )}
                            {session.status === "Absent" && (
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                            )}
                          </div>
                        </div>
                        <p className="hidden sm:flex items-center gap-1.5 truncate text-muted-foreground group-hover/item:text-inherit">
                          <Users className="h-3 w-3" />
                          {session.batch}
                        </p>
                        <p className="font-mono truncate">
                          {format(new Date(session.date), "p")}
                        </p>
                      </button>
                    ))}

                    {overflowCount > 0 && (
                      <button
                        onClick={() => setSelectedDaySessions(daySessions)}
                        className="text-xs text-blue-600 underline pt-1 hover:text-blue-800"
                      >
                        +{overflowCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog to show all session details for a day */}
      {selectedDaySessions && (
        <Dialog open={true} onOpenChange={() => setSelectedDaySessions(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Sessions on{" "}
                {format(
                  new Date(selectedDaySessions[0]?.date || new Date()),
                  "PPPP"
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {selectedDaySessions.map((session) => (
                <Card
                  key={session.id}
                  onClick={() => {
                    setSelectedDaySessions(null);
                    onSessionClick(session);
                  }}
                  className={cn(
                    "cursor-pointer border-l-4 transition shadow-sm hover:shadow-md",
                    {
                      "border-muted": session.status === "Scheduled",
                      "border-green-500": session.status === "Completed",
                      "border-red-500": session.status === "Cancelled",
                      "border-amber-500": session.status === "Absent",
                    }
                  )}
                >
                  <CardContent className="p-4 space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">{session.sessionType}</span>
                      <span className="font-mono text-muted-foreground">
                        {format(new Date(session.date), "p")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      <Users className="inline mr-1 h-4 w-4" />
                      Batch: {session.batch}
                    </p>
                    <p className="text-muted-foreground">{session.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
