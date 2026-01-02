import { useMemo, useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns";
import type { Session, User } from "../../lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Ban,
  AlertTriangle,
  Users,
  MapPin,
  CalendarDays,
  User as UserIcon,
} from "lucide-react";

interface WeekViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  trainers?: User[];
}

export default function WeekView({
  sessions,
  onSessionClick,
  trainers = [],
}: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleGoToCurrentWeek = () => setCurrentDate(new Date());

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const sessionsInView = useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate =
        session.date instanceof Date ? session.date : new Date(session.date);
      return (
        isSameDay(sessionDate, weekStart) ||
        isSameDay(sessionDate, weekEnd) ||
        (sessionDate > weekStart && sessionDate < weekEnd)
      );
    });
  }, [sessions, weekStart, weekEnd]);

  return (
    <Card className="border-2 border-border overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 border-b-2 border-border">
        <div>
          <CardTitle className="text-xl tracking-tight">Week View</CardTitle>
          <CardDescription className="text-base font-medium text-foreground">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGoToCurrentWeek}
            className="border border-border bg-background hover:bg-muted text-foreground px-3 py-1 rounded"
            type="button"
          >
            Current Week
          </Button>
          <Button
            onClick={handlePrevWeek}
            className="border border-border bg-background hover:bg-muted text-foreground rounded-full p-2 h-9 w-9"
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button
            onClick={handleNextWeek}
            className="border border-border bg-background hover:bg-muted text-foreground rounded-full p-2 h-9 w-9"
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next Week</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {days.map((day) => {
            const daySessions = sessions
              .filter((session) => isSameDay(new Date(session.date), day))
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              );

            return (
              <div
                key={day.toString()}
                className={cn(
                  "p-4 flex flex-col md:flex-row gap-4 md:gap-6",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="md:w-40 flex-shrink-0">
                  <h3
                    className={cn(
                      "font-bold text-xl",
                      isToday(day) && "text-primary"
                    )}
                  >
                    {format(day, "eeee")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {format(day, "MMMM d")}
                  </p>
                </div>
                <div className="flex-1">
                  {daySessions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {daySessions.map((session) => {
                        const sessionDate = new Date(session.date);
                        const trainer = trainers.find(
                          (t) => String(t.id) === String(session.trainerId)
                        );

                        return (
                          <button
                            key={session.id}
                            onClick={() => onSessionClick(session)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg text-sm transition-all duration-200 border-l-4 flex flex-col justify-between min-h-[140px] hover:shadow-lg hover:-translate-y-0.5 border-border",
                              {
                                "bg-card": session.status === "Scheduled",
                                "bg-green-50 dark:bg-green-950/40":
                                  session.status === "Completed",
                                "bg-red-50 dark:bg-red-950/30 line-through":
                                  session.status === "Cancelled",
                                "bg-amber-50 dark:bg-amber-950/40":
                                  session.status === "Absent",
                              }
                            )}
                          >
                            <div
                              className={cn({
                                "text-muted-foreground":
                                  session.status !== "Scheduled",
                              })}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="font-bold text-base text-foreground truncate">
                                  {session.sessionType}
                                </p>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <Badge className="font-mono text-xs h-5 px-1.5 border border-border bg-muted text-foreground dark:bg-background dark:text-foreground">
                                    {format(sessionDate, "p")}
                                  </Badge>
                                  {session.status === "Started" && (
                                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Started
                                    </span>
                                  )}
                                  {session.status === "Completed" && (
                                    <span className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Completed
                                    </span>
                                  )}
                                  {session.status === "Cancelled" && (
                                    <span className="flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                                      <Ban className="h-4 w-4 mr-1" />
                                      Cancelled
                                    </span>
                                  )}
                                  {session.status === "Absent" && (
                                    <span className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300 dark:border-amber-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      Absent
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="flex items-center gap-1.5 truncate text-xs mt-1 text-current">
                                <UserIcon className="h-3.5 w-3.5" />
                                {trainer?.name || "N/A"}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "mt-2 space-y-1",
                                session.status !== "Scheduled" &&
                                  "text-muted-foreground"
                              )}
                            >
                              <p className="flex items-center gap-1.5 truncate text-xs">
                                <Users className="h-3.5 w-3.5" />
                                {session.batch}
                              </p>
                              <p className="flex items-center gap-1.5 truncate text-xs">
                                <MapPin className="h-3.5 w-3.5" />
                                {session.location}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-muted-foreground text-sm italic h-full min-h-[140px] bg-muted/20 rounded-lg">
                      No sessions
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {sessionsInView.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <CalendarDays className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">No sessions scheduled.</p>
            <p>Your schedule is clear for the selected week.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
