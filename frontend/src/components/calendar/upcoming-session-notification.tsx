import { useMemo } from "react";
import { format, differenceInMinutes, isToday } from "date-fns";
import { Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { Session } from "../../lib/types";

interface UpcomingSessionNotificationProps {
  sessions: Session[];
}

export default function UpcomingSessionNotification({
  sessions,
}: UpcomingSessionNotificationProps) {
  const upcomingSession = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((session) => {
        const sessionDate =
          session.date instanceof Date ? session.date : new Date(session.date);
        return sessionDate > now && session.status === "Scheduled";
      })
      .sort((a, b) => {
        const aDate = a.date instanceof Date ? a.date : new Date(a.date);
        const bDate = b.date instanceof Date ? b.date : new Date(b.date);
        return aDate.getTime() - bDate.getTime();
      })[0];
  }, [sessions]);

  if (!upcomingSession) {
      return (
        <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No Upcoming Sessions</h3>
                <p className="text-xs text-slate-500 mt-1">You are all caught up!</p>
            </CardContent>
        </Card>
      );
  }

  const sessionDate =
    upcomingSession.date instanceof Date
      ? upcomingSession.date
      : new Date(upcomingSession.date);
  
  const isSessionToday = isToday(sessionDate);
  const minutesUntil = differenceInMinutes(sessionDate, new Date());
  
  const timeDisplay = isSessionToday 
    ? minutesUntil < 60 
        ? `In ${minutesUntil} mins` 
        : `Today at ${format(sessionDate, "p")}`
    : format(sessionDate, "EEEE, p");

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-lg text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock className="w-24 h-24" />
      </div>
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium text-indigo-100 uppercase tracking-wider">
                Next Session
            </CardTitle>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 font-mono">
                {timeDisplay}
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-1">
            {upcomingSession.sessionType}
        </h3>
        <div className="flex items-center gap-2 text-indigo-100 text-sm mb-4">
            <span className="font-medium bg-indigo-500/30 px-2 py-0.5 rounded">
                {upcomingSession.batch}
            </span>
            <span>•</span>
            <span>{upcomingSession.duration} min</span>
        </div>
        
        <div className="flex items-center text-xs text-indigo-200 gap-1.5 opacity-80 bg-black/10 p-2 rounded-lg backdrop-blur-sm">
             <Calendar className="w-3.5 h-3.5" />
             {format(sessionDate, "MMMM do, yyyy")}
        </div>
      </CardContent>
    </Card>
  );
}
