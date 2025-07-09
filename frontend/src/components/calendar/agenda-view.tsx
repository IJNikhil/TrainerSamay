import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import type { Session, User } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { MapPin, CheckCircle, Ban, User as UserIcon, Users, AlertTriangle } from 'lucide-react';

interface AgendaViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  trainers: User[]; // <-- Real trainers from backend
}

const sessionTypeBorderClasses: { [key: string]: string } = {
  Yoga: 'border-emerald-500/80',
  Strength: 'border-sky-500/80',
  Cardio: 'border-rose-500/80',
  Consultation: 'border-amber-500/80',
};

export default function AgendaView({ sessions, onSessionClick, trainers = [] }: AgendaViewProps) {
  const groupedSessions = useMemo(() => {
    const sortedSessions = [...sessions].sort((a, b) => {
      const aDate = a.date instanceof Date ? a.date : new Date(a.date);
      const bDate = b.date instanceof Date ? b.date : new Date(b.date);
      return aDate.getTime() - bDate.getTime();
    });

    return sortedSessions.reduce((acc, session) => {
      const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
      const dateKey = format(sessionDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, Session[]>);
  }, [sessions]);

  const sortedDates = Object.keys(groupedSessions).sort();

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <p className="text-lg">No sessions scheduled.</p>
          <p>The calendar is clear!</p>
        </CardContent>
      </Card>
    );
  }

const getTrainerName = (trainerId: string | number) =>
  trainers.find(t => String(t.id) === String(trainerId))?.name || 'Unknown';


  return (
    <div className="space-y-4">
      {sortedDates.map(dateKey => {
        const daySessions = groupedSessions[dateKey];
        const day = daySessions[0].date instanceof Date ? daySessions[0].date : new Date(daySessions[0].date);

        return (
          <div key={dateKey}>
            <div className={cn(
                "font-semibold mb-3 p-3 rounded-lg text-lg sticky top-[60px] bg-background/95 backdrop-blur-sm z-10 border-b-2",
                isToday(day) ? 'border-primary' : 'border-border'
            )}>
              {format(day, 'eeee, MMMM do')}
              {isToday(day) && (
                <Badge className="ml-3 bg-primary text-primary-foreground">Today</Badge>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {daySessions.map(session => {
                const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
                return (
                  <Card 
                    key={session.id} 
                    onClick={() => onSessionClick(session)} 
                    className={cn(
                        "cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform border-l-4 flex flex-col",
                        sessionTypeBorderClasses[session.sessionType] || 'border-border',
                        {
                          'bg-card': session.status === 'Scheduled',
                          'bg-green-50 dark:bg-green-950/40': session.status === 'Completed',
                          'bg-red-50 dark:bg-red-950/30 line-through': session.status === 'Cancelled',
                          'bg-amber-50 dark:bg-amber-950/40': session.status === 'Absent',
                        }
                    )}
                  >
                    <CardHeader className="p-4">
<CardTitle className="text-xl flex justify-between items-start">
  <span>{session.sessionType}</span>
  <div className="flex flex-col items-end gap-2">
    <Badge className="
  font-mono text-xs h-5 px-1.5
  border border-border
  bg-muted text-foreground
  dark:bg-background dark:text-foreground
">
  {format(sessionDate, 'p')}
</Badge>

    {session.status === 'Started' && (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 mr-1" />
        Started
      </Badge>
    )}
    {session.status === 'Completed' && (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300 dark:border-green-600 flex items-center gap-1">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    )}
    {session.status === 'Cancelled' && (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300 dark:border-red-600 flex items-center gap-1">
        <Ban className="w-3 h-3 mr-1" />
        Cancelled
      </Badge>
    )}
    {session.status === 'Absent' && (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300 dark:border-amber-700 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Absent
      </Badge>
    )}
  </div>
</CardTitle>

                    </CardHeader>
                    <CardContent className={cn("p-4 pt-0 space-y-2 text-sm flex-1 flex flex-col justify-between", {
                        'text-muted-foreground': session.status !== 'Scheduled'
                      })}>
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <p><strong>Batch:</strong> {session.batch}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          <p><strong>Trainer:</strong> {getTrainerName(session.trainerId)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-inherit pt-2 mt-2 border-t border-dashed">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{session.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      })}
    </div>
  );
}
