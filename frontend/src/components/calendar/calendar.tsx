import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, Ban, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import type { Session } from '../../lib/types';
import { cn } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
} from "../ui/card"

interface CalendarProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

const sessionTypeBorderClasses: { [key: string]: string } = {
  Yoga: 'border-emerald-500',
  Strength: 'border-sky-500',
  Cardio: 'border-rose-500',
  Consultation: 'border-amber-500',
};

export default function Calendar({ sessions, onSessionClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const startingDay = getDay(start);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Card className="overflow-hidden border-2 border-border">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50 border-b-2 border-border">
        <h2 className="font-bold text-xl tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={goToToday}
            className="border border-border bg-background hover:bg-muted text-foreground px-3 py-1 rounded"
            type="button"
          >
            Today
          </Button>
          <Button
            onClick={prevMonth}
            className="border border-border bg-background hover:bg-muted text-foreground rounded-full p-2"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={nextMonth}
            className="border border-border bg-background hover:bg-muted text-foreground rounded-full p-2"
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7">
          {days.map(day => (
            <div key={day} className="text-center font-semibold text-muted-foreground text-sm py-3 border-b border-r border-border bg-muted/30">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
          
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-border bg-muted/20 min-h-[120px]" />
          ))}

          {daysInMonth.map((day, index) => {
            // Always convert session.date to Date before using
            const daySessions = sessions
              .filter(session => {
                const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
                return isSameDay(sessionDate, day);
              })
              .sort((a, b) => {
                const aDate = a.date instanceof Date ? a.date : new Date(a.date);
                const bDate = b.date instanceof Date ? b.date : new Date(b.date);
                return aDate.getTime() - bDate.getTime();
              });

            return (
              <div
                key={day.toString()}
                className={cn(
                  'relative border-b border-r border-border p-1 sm:p-2 flex flex-col min-h-[120px] group transition-colors duration-200',
                  (index + startingDay + 1) % 7 === 0 ? 'border-r-0' : '',
                  isToday(day) ? 'bg-primary/10' : 'hover:bg-muted/50'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className={cn(
                  'font-semibold text-sm flex items-center justify-center h-8 w-8 rounded-full mb-1', 
                  isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </time>
                <div className="flex-grow space-y-1 mt-1 overflow-y-auto">
                  {daySessions.map(session => {
                    const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
                    return (
                      <button
                        key={session.id}
                        onClick={() => onSessionClick(session)}
                        className={cn(
                          'w-full text-left p-1.5 rounded-md text-xs transition-all duration-200 group/item relative overflow-hidden',
                          'border-l-4 hover:shadow-md',
                          sessionTypeBorderClasses[session.sessionType] || 'border-border',
                          {
                            'bg-muted/60 hover:bg-muted text-foreground': session.status === 'Scheduled',
                            'bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-200': session.status === 'Completed',
                            'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 line-through': session.status === 'Cancelled',
                            'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200': session.status === 'Absent',
                          }
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold truncate pr-1">{session.sessionType}</p>
<div className="flex-shrink-0">
  {session.status === 'Started' && <CheckCircle className="h-3 w-3 text-yellow-500" />}
  {session.status === 'Completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
  {session.status === 'Cancelled' && <Ban className="h-3 w-3 text-red-600" />}
  {session.status === 'Absent' && <AlertTriangle className="h-3 w-3 text-amber-600" />}
</div>

                        </div>
                        <p className="hidden sm:flex items-center gap-1.5 truncate text-muted-foreground group-hover/item:text-inherit"><Users className="h-3 w-3" /> {session.batch}</p>
                        <p className="font-mono truncate">{format(sessionDate, 'p')}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
