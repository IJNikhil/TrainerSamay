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
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50/50 border-b border-slate-100">
        <div>
          <CardTitle className="text-xl tracking-tight text-slate-800">Week View</CardTitle>
          <CardDescription className="text-base font-medium text-slate-600">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGoToCurrentWeek}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md shadow-sm text-sm font-medium transition-colors"
            type="button"
          >
            Current Week
          </Button>
          <Button
            onClick={handlePrevWeek}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-full p-2 h-9 w-9 shadow-sm"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button
            onClick={handleNextWeek}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-full p-2 h-9 w-9 shadow-sm"
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Week</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
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
                  "p-4 flex flex-col md:flex-row gap-4 md:gap-6 hover:bg-slate-50/30 transition-colors",
                  isToday(day) && "bg-indigo-50/20"
                )}
              >
                <div className="md:w-32 flex-shrink-0 pt-1">
                  <h3
                    className={cn(
                      "font-bold text-lg",
                      isToday(day) ? "text-indigo-600" : "text-slate-700"
                    )}
                  >
                    {format(day, "eeee")}
                  </h3>
                  <p className={cn("text-sm", isToday(day) ? "text-indigo-500 font-medium" : "text-slate-500")}>
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
                              "w-full text-left p-3 rounded-lg text-sm transition-all duration-200 border-l-[3px] flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-white border border-slate-200/60",
                              {
                                "border-l-indigo-500": session.status === "Scheduled",
                                "border-l-emerald-500 bg-emerald-50/10":
                                  session.status === "Completed",
                                "border-l-red-500 bg-red-50/10 opacity-75":
                                  session.status === "Cancelled",
                                "border-l-amber-500 bg-amber-50/10":
                                  session.status === "Absent",
                              }
                            )}
                          >
                            <div className="w-full">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-semibold text-slate-800 text-base leading-tight truncate pr-1">
                                  {session.sessionType}
                                </p>
                                <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5 border-slate-200 bg-slate-50 text-slate-600 shrink-0">
                                  {format(sessionDate, "p")}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 mb-2">
                                <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                                  <UserIcon className="h-3 w-3 text-slate-400" />
                                  <span className="font-medium text-slate-600">{trainer?.name || "Unassigned"}</span>
                                </p>
                                <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                                  <Users className="h-3 w-3 text-slate-400" />
                                  {session.batch}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto w-full">
                              <div className="flex items-center gap-1 text-xs text-slate-400 max-w-[60%]">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{session.location || "No Location"}</span>
                              </div>
                              
                              {session.status === "Completed" && (
                                <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                                  <CheckCircle className="h-3 w-3" /> Done
                                </span>
                              )}
                              {session.status === "Cancelled" && (
                                <span className="flex items-center gap-1 text-red-600 text-[10px] font-semibold uppercase tracking-wider">
                                  <Ban className="h-3 w-3" /> Off
                                </span>
                              )}
                             {session.status === "Absent" && (
                                <span className="flex items-center gap-1 text-amber-600 text-[10px] font-semibold uppercase tracking-wider">
                                  <AlertTriangle className="h-3 w-3" /> Absent
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-center text-slate-400 text-sm italic h-full min-h-[80px] border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      No sessions scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {sessionsInView.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <CalendarDays className="mx-auto h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-semibold text-slate-700">No sessions available.</p>
            <p className="text-sm">Your schedule is empty for this week.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

