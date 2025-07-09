"use client";

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Bell } from 'lucide-react';
import type { Session, User } from '../../lib/types';

interface UpcomingSessionNotificationProps {
  sessions: Session[];
  trainers: User[];
  currentTrainer?: User;
}

export default function UpcomingSessionNotification({
  sessions,
  trainers = [],
  currentTrainer,
}: UpcomingSessionNotificationProps) {
  const upcomingSession = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(session => {
        const sessionDate = session.date instanceof Date ? session.date : new Date(session.date);
        return sessionDate > now && session.status === 'Scheduled';
      })
      .sort((a, b) => {
        const aDate = a.date instanceof Date ? a.date : new Date(a.date);
        const bDate = b.date instanceof Date ? b.date : new Date(b.date);
        return aDate.getTime() - bDate.getTime();
      })[0];
  }, [sessions]);

  if (!upcomingSession) {
    return null;
  }

  // For trainer, show "your" session; for admin, show trainer name
  let trainerName = "";
  if (currentTrainer && currentTrainer.role === "trainer") {
    trainerName = currentTrainer.name;
  } else {
    const trainer = trainers.find(t => t.id === upcomingSession.trainerId);
    trainerName = trainer?.name || "Trainer";
  }

  const sessionDate = upcomingSession.date instanceof Date ? upcomingSession.date : new Date(upcomingSession.date);

  return (
    <Alert className="bg-accent/20 border-accent/50">
      <Bell className="h-4 w-4" />
      <AlertTitle>Upcoming Session</AlertTitle>
      <AlertDescription>
        Your next session is a <strong>{upcomingSession.sessionType}</strong> class for the <strong>{upcomingSession.batch}</strong> batch on{' '}
        <strong>{format(sessionDate, 'eeee, MMMM do')} at {format(sessionDate, 'p')}</strong>.
      </AlertDescription>
    </Alert>
  );
}
