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
  isSameMonth,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";
import type { Session } from "../../lib/types";

interface CalendarViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

const MAX_VISIBLE_SESSIONS_PER_DAY = 3;

export function CalendarView({ 
  sessions, 
  onSessionClick, 
  onDateClick,
  selectedDate 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const startingDay = getDay(start);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateClick?.(today);
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white rounded-xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-6 bg-white border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100/80 rounded-lg p-1">
            <Button 
              onClick={prevMonth} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-md transition-all text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              onClick={nextMonth} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-md transition-all text-slate-500"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <Button 
          onClick={goToToday} 
          variant="outline" 
          className="border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 font-medium"
        >
          Today
        </Button>
      </CardHeader>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-3"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-50">
        {Array.from({ length: startingDay }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="border-b border-r border-slate-100 bg-slate-50/30 min-h-[140px]"
          />
        ))}

        {daysInMonth.map((day, index) => {
          const daySessions = sessions
            .filter((session) => isSameDay(new Date(session.date), day))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const visibleSessions = daySessions.slice(0, MAX_VISIBLE_SESSIONS_PER_DAY);
          const overflowCount = daySessions.length - visibleSessions.length;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={cn(
                "relative border-b border-r border-slate-100 p-2 flex flex-col min-h-[140px] transition-all cursor-pointer group",
                (index + startingDay + 1) % 7 === 0 ? "border-r-0" : "",
                !isCurrentMonth && "bg-slate-50/50 text-slate-400",
                isSelected && "bg-indigo-50/50 ring-2 ring-inset ring-indigo-500/20 z-10",
                !isSelected && isDayToday ? "bg-white" : "bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                    isDayToday
                      ? "bg-indigo-600 text-white shadow-md"
                      : isSelected 
                        ? "text-indigo-700 bg-indigo-100"
                        : "text-slate-700 group-hover:bg-slate-100"
                  )}
                >
                  {format(day, "d")}
                </span>
                {daySessions.length > 0 && (
                   <span className="text-[10px] font-medium text-slate-400">
                     {daySessions.length} events
                   </span>
                )}
              </div>

              <div className="flex-grow space-y-1.5 overflow-hidden">
                {visibleSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionClick(session);
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md text-xs transition-all border shadow-sm group/item flex items-center justify-between gap-2 overflow-hidden",
                      {
                        "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md": session.status === "Scheduled",
                        "bg-emerald-50 border-emerald-100 text-emerald-800 hover:border-emerald-300": session.status === "Completed",
                        "bg-red-50 border-red-100 text-red-800 opacity-75 hover:opacity-100": session.status === "Cancelled",
                        "bg-amber-50 border-amber-100 text-amber-800 hover:border-amber-300": session.status === "Absent",
                      }
                    )}
                  >
                    <span className="truncate font-medium flex-1">
                      {session.sessionType}
                    </span>
                    <span className="text-[10px] opacity-70 whitespace-nowrap hidden sm:inline-block">
                       {format(new Date(session.date), "p")}
                    </span>
                  </button>
                ))}

                {overflowCount > 0 && (
                  <div className="text-[10px] font-medium text-slate-500 pl-1 mt-1 hover:text-indigo-600">
                    +{overflowCount} more...
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Fill remaining cells to complete the grid row */}
        {Array.from({ length: (7 - ((daysInMonth.length + startingDay) % 7)) % 7 }).map((_, i) => (
             <div
            key={`end-empty-${i}`}
            className="border-b border-r border-slate-100 bg-slate-50/30 min-h-[140px]"
          />
        ))}

      </div>
    </Card>
  );
}
