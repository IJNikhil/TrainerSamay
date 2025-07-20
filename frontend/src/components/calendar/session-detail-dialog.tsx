import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Calendar, Clock, Tag, MapPin, UserCircle,
  CheckCircle, Ban, Users, AlertTriangle, Play,
} from 'lucide-react';
import type { Session, SessionStatus, User } from '../../lib/types';
import { format, isToday } from 'date-fns';
import { cn } from '../../lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface SessionDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  session: Session | null;
  onUpdateSession?: (sessionUpdate: Partial<Session> & { id: string }) => void;
  trainers: User[];
  currentUser?: User;
}

const statusBadgeClasses: { [key: string]: string } = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200',
  Started: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200',
  Completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200',
  Absent: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200',
};

export function SessionDetailDialog({
  isOpen,
  setIsOpen,
  session,
  onUpdateSession,
  trainers = [],
  currentUser,
}: SessionDetailDialogProps) {
  const isSessionToday = useMemo(() => {
    if (!session) return false;
    return isToday(session.date instanceof Date ? session.date : new Date(session.date));
  }, [session]);

  if (!session) return null;
  const nonNullSession = session;

  const trainer = trainers.find(
    t => String(t.id) === String(nonNullSession.trainerId)
  );

  const status = nonNullSession.status;

  const handleUpdateStatus = (status: SessionStatus) => {
    if (onUpdateSession) {
      onUpdateSession({
        id: nonNullSession.id,
        status,
      });
    }
  };

  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-4">
      <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold text-base">{value}</p>
      </div>
    </div>
  );

  const sessionDate = nonNullSession.date instanceof Date ? nonNullSession.date : new Date(nonNullSession.date);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-auto max-w-[90vw] min-w-[30vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <span>Session Details</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-5 max-h-[60vh] overflow-y-auto px-1 -mx-1">
          <div className="flex justify-between items-start px-1">
            <div>
              <p className="text-sm text-muted-foreground">Session Name/ Type</p>
              <h3 className="text-xl font-bold">{nonNullSession.sessionType}</h3>
            </div>
            <Badge className={cn("capitalize text-base font-semibold border-2", statusBadgeClasses[nonNullSession.status])}>
              {nonNullSession.status === 'Absent' && <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />}
              {nonNullSession.status}
            </Badge>
          </div>
          <Separator />
          <div className="grid gap-4 px-1">
            <DetailItem icon={Users} label="Batch" value={nonNullSession.batch} />
            <DetailItem icon={UserCircle} label="Trainer" value={trainer?.name || 'Unknown Trainer'} />
            <DetailItem icon={Calendar} label="Date" value={format(sessionDate, 'eeee, MMMM do, yyyy')} />
            <DetailItem icon={Clock} label="Time & Duration" value={`${format(sessionDate, 'p')} (${nonNullSession.duration} minutes)`} />
            <DetailItem icon={MapPin} label="Location" value={nonNullSession.location} />
          </div>
          <Separator />
        </div>
        <DialogFooter className="pt-4 mt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2">
          {currentUser?.role === "admin" ? (
            // Admin: Only show Close
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="border border-border bg-background hover:bg-muted text-foreground"
            >
              Close
            </Button>
          ) : (
            // Trainer: Show actions based on status
            <>
              <div className="w-full sm:w-auto">
                {onUpdateSession && (status === 'Scheduled' || status === 'Started') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90 flex items-center gap-2" type="button">
                        <Ban className="mr-2 h-4 w-4" /> Cancel Session
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the session as cancelled. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleUpdateStatus('Cancelled')} className="bg-destructive hover:bg-destructive/90">
                          Yes, Cancel Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button type="button" onClick={() => setIsOpen(false)} className="border border-border bg-background hover:bg-muted text-foreground">
                  Close
                </Button>
                {onUpdateSession && status === 'Scheduled' && (
                  <Button
                    onClick={() => handleUpdateStatus('Started')}
                    className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
                    disabled={!isSessionToday}
                    type="button"
                  >
                    <Play className="mr-2 h-4 w-4" /> Start Session
                  </Button>
                )}
                {onUpdateSession && status === 'Started' && (
                  <Button
                    onClick={() => handleUpdateStatus('Completed')}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    disabled={!isSessionToday}
                    type="button"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
