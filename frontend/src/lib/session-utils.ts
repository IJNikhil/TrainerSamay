import type { Session, SessionStatus } from './types';
import { isPast, isToday } from 'date-fns';

export function processSessions(sessions: Session[] = []): Session[] {
  return (sessions || []).map(session => {
    const sessionDate = typeof session.date === 'string' ? new Date(session.date) : session.date;
    if (session.status === 'Scheduled' && isPast(sessionDate) && !isToday(sessionDate)) {
      return { ...session, status: 'Absent' as SessionStatus, date: sessionDate };
    }
    return { ...session, date: sessionDate };
  });
}
