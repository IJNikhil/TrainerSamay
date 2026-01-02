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
import { Badge } from "../ui/badge";
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
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white rounded-lg">
        <CardHeader className="flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={goToToday} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
              Today
            </Button>
            <Button onClick={prevMonth} variant="outline" size="icon" className="border-slate-200 text-slate-700 hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={nextMonth} variant="outline" size="icon" className="border-slate-200 text-slate-700 hover:bg-slate-100">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {days.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-slate-500 text-sm py-3 border-b border-r border-slate-100 bg-slate-50/30"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}

            {Array.from({ length: startingDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border-b border-r border-slate-100 bg-slate-50/10 min-h-[120px]"
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
                    "relative border-b border-r border-slate-100 p-1 sm:p-2 flex flex-col min-h-[120px] group transition-colors",
                    (index + startingDay + 1) % 7 === 0 ? "border-r-0" : "",
                    isToday(day) ? "bg-indigo-50/10" : "hover:bg-slate-50/30"
                  )}
                >
                  <time
                    className={cn(
                      "font-semibold text-sm flex items-center justify-center h-8 w-8 rounded-full mb-1 transition-colors",
                      isToday(day)
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 group-hover:bg-slate-100"
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
                          "w-full text-left p-1.5 rounded-md text-xs border-l-[3px] transition-all group/item relative border-transparent shadow-sm hover:shadow-md",
                          {
                            "bg-white border-l-indigo-500 text-slate-700": session.status === "Scheduled",
                            "bg-emerald-50 border-l-emerald-500 text-emerald-800": session.status === "Completed",
                            "bg-red-50 border-l-red-500 text-red-800 opacity-75 decoration-slate-400": session.status === "Cancelled",
                            "bg-amber-50 border-l-amber-500 text-amber-800": session.status === "Absent",
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
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                            )}
                            {session.status === "Cancelled" && (
                              <Ban className="h-3 w-3 text-red-600" />
                            )}
                            {session.status === "Absent" && (
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                            )}
                          </div>
                        </div>
                        <p className="hidden sm:flex items-center gap-1.5 truncate text-slate-500 group-hover/item:text-slate-700">
                          <Users className="h-3 w-3" />
                          {session.batch}
                        </p>
                        <p className="font-mono truncate text-slate-400 text-[10px]">
                          {format(new Date(session.date), "p")}
                        </p>
                      </button>
                    ))}

                    {overflowCount > 0 && (
                      <button
                        onClick={() => setSelectedDaySessions(daySessions)}
                        className="text-xs text-indigo-600 font-medium hover:underline pt-1 w-full text-left pl-1"
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
          <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border-slate-200">
            <DialogHeader className="p-6 pb-2 border-b border-slate-100 bg-slate-50/50">
              <DialogTitle className="text-xl text-slate-800">
                Sessions on{" "}
                <span className="text-indigo-600">
                  {format(
                    new Date(selectedDaySessions[0]?.date || new Date()),
                    "PPPP"
                  )}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto bg-slate-50/30">
              {selectedDaySessions.map((session) => (
                <Card
                  key={session.id}
                  onClick={() => {
                    setSelectedDaySessions(null);
                    onSessionClick(session);
                  }}
                  className={cn(
                    "cursor-pointer border-l-4 transition-all shadow-sm hover:shadow-md bg-white border-t-0 border-r-0 border-b-0",
                    {
                      "border-l-indigo-500": session.status === "Scheduled",
                      "border-l-emerald-500": session.status === "Completed",
                      "border-l-red-500": session.status === "Cancelled",
                      "border-l-amber-500": session.status === "Absent",
                    }
                  )}
                >
                  <CardContent className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-start gap-2">
                       <span className="font-bold text-lg text-slate-800">{session.sessionType}</span>
                       <Badge variant="outline" className="font-mono text-xs border-slate-200  bg-slate-50">
                        {format(new Date(session.date), "p")}
                       </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                         <p className="flex items-center gap-2">
                           <Users className="h-4 w-4 text-slate-400" />
                           <span>{session.batch}</span>
                         </p>
                         <p className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{session.location}</span>
                         </p>
                    </div>
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
