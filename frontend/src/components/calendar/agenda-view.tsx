"use client";

import { useMemo } from "react";
import { format, isToday, isAfter, startOfDay } from "date-fns";
import type { Session, User } from "../../lib/types";

import {
  MapPin,
  Users,
  User as UserIcon,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface AgendaViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  trainers: User[];
}

export default function AgendaView({
  sessions,
  onSessionClick,
  trainers = [],
}: AgendaViewProps) {
  // Filter and group only upcoming sessions (from today onwards)
  const groupedSessions = useMemo(() => {
    const today = startOfDay(new Date());
    const upcoming = sessions.filter((session) => {
      const date = session.date instanceof Date ? session.date : new Date(session.date);
      return isToday(date) || isAfter(date, today);
    });

    const sorted = [...upcoming].sort((a, b) => {
      const aDate = a.date instanceof Date ? a.date : new Date(a.date);
      const bDate = b.date instanceof Date ? b.date : new Date(b.date);
      return aDate.getTime() - bDate.getTime();
    });

    return sorted.reduce((acc, session) => {
      const dateKey = format(
        session.date instanceof Date ? session.date : new Date(session.date),
        "yyyy-MM-dd"
      );
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, Session[]>);
  }, [sessions]);

  const sortedDates = Object.keys(groupedSessions).sort();

  if (sortedDates.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <p className="text-lg">No upcoming sessions.</p>
          <p>The agenda looks clear!</p>
        </CardContent>
      </Card>
    );
  }

  const getTrainerName = (trainerId: string | number) =>
    trainers.find((t) => String(t.id) === String(trainerId))?.name || "Unknown";

  return (
    <div className="space-y-8">
      {sortedDates.map((dateKey) => {
        const daySessions = groupedSessions[dateKey];
        const day = new Date(dateKey);

        return (
          <div key={dateKey}>
            <div
              className={cn(
                "font-semibold mb-4 px-1 text-lg sticky top-[60px] bg-gray-50/95 backdrop-blur-sm z-10 py-2 border-b border-indigo-100 flex items-center gap-2",
                isToday(day) ? "text-indigo-700" : "text-slate-700"
              )}
            >
              <span>{format(day, "eeee, MMMM do")}</span>
              {isToday(day) && (
                <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border-0">Today</Badge>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {daySessions.map((session) => {
                const sessionDate =
                  session.date instanceof Date ? session.date : new Date(session.date);

                return (
                  <Card
                    key={session.id}
                    onClick={() => onSessionClick(session)}
                    className={cn(
                      "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-l-[4px] flex flex-col bg-white border-slate-200 shadow-sm",
                      {
                        "border-l-indigo-500": session.status === "Scheduled",
                        "border-l-emerald-500": session.status === "Completed",
                        "border-l-red-500 opacity-80": session.status === "Cancelled",
                        "border-l-amber-500": session.status === "Absent",
                      }
                    )}
                  >
                    <CardHeader className="p-4 bg-white rounded-t-lg">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg font-bold text-slate-800 leading-snug break-words">
                          {session.sessionType}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-[10px] shrink-0 border-slate-200 bg-slate-50 text-slate-600">
                          {format(sessionDate, "p")}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                          {session.status === "Started" && (
                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 shadow-none">Started</Badge>
                          )}
                          {session.status === "Completed" && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-none">Completed</Badge>
                          )}
                          {session.status === "Cancelled" && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-none">Cancelled</Badge>
                          )}
                          {session.status === "Absent" && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-none">Absent</Badge>
                          )}
                      </div>
                    </CardHeader>

                    <CardContent
                      className="p-4 pt-0 space-y-3 text-sm flex-1 flex flex-col justify-between"
                    >
                      <div className="space-y-2 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>
                            Batch: <span className="font-medium text-slate-800">{session.batch}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>
                             Trainer: <span className="font-medium text-slate-800">{getTrainerName(session.trainerId)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-slate-500 pt-3 mt-2 border-t border-slate-100">
                        <MapPin className="w-3 h-3 mr-1.5 text-slate-400" />
                        <span className="truncate">{session.location || "No Location"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
