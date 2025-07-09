import { useState, useMemo, useEffect } from "react";
import { PlusCircle, Calendar as CalendarIcon, List, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { processSessions } from "../lib/session-utils";
import type { Session, User, Availability } from "../lib/types";

// Import API functions
import {
  fetchSessions,
  updateSessionApi,
} from "../api/sessions";
import {
  fetchTrainers,
  fetchAvailabilities,
} from "../api/availability";

// Import UI components
import AgendaView from "../components/calendar/agenda-view";
import { SessionDetailDialog } from "../components/calendar/session-detail-dialog";
import TrainerFilter from "../components/calendar/trainer-filter";
import UpcomingSessionNotification from "../components/calendar/upcoming-session-notification";
import WeekView from "../components/calendar/week-view";
import AdminDashboard from "../components/dashboard/admin-dashboard";
import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import { Button } from "../components/ui/button";
import CalendarView from "../components/calendar/calendar";
import { SessionDialog } from "../components/calendar/session-dialog";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  const [filteredTrainerId, setFilteredTrainerId] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<Session | null>(null);

  useEffect(() => {
    setLoading(true);
    // For admin, fetch all. For trainer, fetch only their sessions.
    const fetch = user?.role === "admin"
      ? fetchSessions()
      : fetchSessions(user?.id);

    Promise.all([
      fetch,
      fetchTrainers(),
      fetchAvailabilities()
    ])
      .then(([sessionsRaw, trainers, availabilities]) => {
        // Always map trainerId and date
        const mappedSessions = (sessionsRaw || []).map((s: any) => ({
          ...s,
          trainerId: String(s.trainer ?? s.trainerId),
          date: typeof s.date === "string" ? new Date(s.date) : s.date,
        }));
        setSessions(mappedSessions);
        setTrainers(trainers || []);
        setAvailabilities(availabilities || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSessionSave = (newOrUpdatedSessions: Session[]) => {
    setSessions(currentSessions => {
      const sessionMap = new Map(currentSessions.map(s => [s.id, s]));
      newOrUpdatedSessions.forEach(s => sessionMap.set(s.id, s));
      return Array.from(sessionMap.values());
    });
    setEditingSession(null);
    toast({
      title: newOrUpdatedSessions.length > 1 ? "Recurring Sessions Created" : "Session Saved",
      description: newOrUpdatedSessions.length > 1 ? `Successfully created ${newOrUpdatedSessions.length} sessions.` : "Your session has been successfully saved.",
    });
  };

  const handleSessionUpdate = async (updatedSession: Partial<Session> & { id: string }) => {
    try {
      // Build payload for backend: only send allowed fields, and always send 'trainerId'
      const updatePayload: any = {};
      if ('trainerId' in updatedSession) updatePayload.trainerId = updatedSession.trainerId;
      if ('batch' in updatedSession) updatePayload.batch = updatedSession.batch;
      if ('sessionType' in updatedSession) updatePayload.sessionType = updatedSession.sessionType;
      if ('date' in updatedSession) {
        updatePayload.date = updatedSession.date instanceof Date
          ? updatedSession.date.toISOString()
          : updatedSession.date;
      }
      if ('duration' in updatedSession) updatePayload.duration = updatedSession.duration;
      if ('location' in updatedSession) updatePayload.location = updatedSession.location;
      if ('notes' in updatedSession) updatePayload.notes = updatedSession.notes;
      if ('status' in updatedSession) updatePayload.status = updatedSession.status;

      const result = await updateSessionApi(updatedSession.id, updatePayload);
      setSessions(currentSessions =>
        currentSessions.map(s => (s.id === updatedSession.id ? result : s))
      );
      toast({
        title: "Session Updated",
        description: updatedSession.status
          ? `The session has been marked as ${updatedSession.status?.toLowerCase()}.`
          : "Your notes have been saved successfully.",
      });
      if (updatedSession.status) {
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update the session in the database.",
        variant: "destructive",
      });
    }
  };

  const handleSessionClick = (session: Session) => {
    // Always open the detail dialog for both admin and trainer
    setViewingSession(session);
    setIsDetailDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingSession(null);
    setIsDialogOpen(true);
  };

  const sessionsToShow = useMemo(() => {
    const processed = processSessions(sessions || []);
    if (user?.role === 'trainer') {
      return processed.filter(session => String(session.trainerId) === String(user.id));
    }
    if (user?.role === 'admin') {
      if (filteredTrainerId === 'all') {
        return processed;
      }
      return processed.filter(session => String(session.trainerId) === String(filteredTrainerId));
    }
    return [];
  }, [user, sessions, filteredTrainerId]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <p>Loading dashboard...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </h2>
          {user?.role === "trainer" && (
            <div className="flex items-center space-x-2">
              <Button onClick={handleAddNewClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Session
              </Button>
            </div>
          )}
        </div>

        {user?.role === 'admin' && (
          <AdminDashboard
            sessions={sessions}
            trainers={trainers}
            availabilities={availabilities}
          />
        )}

        {user?.role === 'trainer' && (
          <UpcomingSessionNotification
            sessions={sessionsToShow}
            trainers={trainers}
            currentTrainer={user}
          />
        )}

        <Tabs defaultValue="week" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="week"><CalendarDays className="mr-2 h-4 w-4" />Week View</TabsTrigger>
              <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" />Month View</TabsTrigger>
              <TabsTrigger value="agenda"><List className="mr-2 h-4 w-4" />Agenda View</TabsTrigger>
            </TabsList>
            {user?.role === "admin" && (
              <div className="p-4 bg-card rounded-lg border w-full sm:w-auto">
                <TrainerFilter
                  trainers={trainers}
                  selectedTrainerId={filteredTrainerId}
                  onTrainerChange={setFilteredTrainerId}
                />
              </div>
            )}
          </div>

          <TabsContent value="week">
            <WeekView
              sessions={sessionsToShow}
              onSessionClick={handleSessionClick}
              trainers={trainers}
            />
          </TabsContent>
          <TabsContent value="calendar">
            <CalendarView
              sessions={sessionsToShow}
              onSessionClick={handleSessionClick}
            />
          </TabsContent>
          <TabsContent value="agenda">
            <AgendaView
              sessions={sessionsToShow}
              onSessionClick={handleSessionClick}
              trainers={trainers}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Trainer: Create/Edit dialog */}
      {user?.role === 'trainer' && (
        <SessionDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          session={editingSession}
          onSessionSave={handleSessionSave}
          sessions={sessions}
          trainers={trainers}
          availabilities={availabilities}
          currentTrainer={user}
        />
      )}

      {/* Trainer & Admin: View session detail dialog */}
      {(user?.role === 'trainer' || user?.role === 'admin') && (
        <SessionDetailDialog
          isOpen={isDetailDialogOpen}
          setIsOpen={setIsDetailDialogOpen}
          session={viewingSession}
          onUpdateSession={handleSessionUpdate}
          trainers={trainers}
          currentUser={user}  
        />
      )}
    </AuthenticatedLayout>
  );
}
