"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle,
  Calendar as CalendarIcon,
  List,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { processSessions } from "../lib/session-utils";
import type { Session, User, Availability, SessionPayload } from "../lib/types";

import {
  fetchSessions,
  updateSessionApi,
} from "../api/sessions";

import {
  fetchTrainers,
  fetchAvailabilities,
} from "../api/availability";

import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";

import AgendaView from "../components/calendar/agenda-view";
import WeekView from "../components/calendar/week-view";
import { CalendarView } from "../components/calendar/calendar";
import TrainerFilter from "../components/calendar/trainer-filter";
import { SessionDialog } from "../components/calendar/session-dialog";
import { SessionDetailDialog } from "../components/calendar/session-detail-dialog";
import UpcomingSessionNotification from "../components/calendar/upcoming-session-notification";
import AdminDashboard from "../components/dashboard/admin-dashboard";

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
    if (!user) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        const sessionPromise =
          user.role === "admin" ? fetchSessions() : fetchSessions(user.id);

        const [sessionsRaw, trainers, availabilities] = await Promise.all([
          sessionPromise,
          fetchTrainers(),
          fetchAvailabilities(),
        ]);

        const mappedSessions = (sessionsRaw ?? []).map((s) => ({
          ...s,
          trainerId: String(s.trainerId),
          date: typeof s.date === "string" ? new Date(s.date) : s.date,
        }));

        setSessions(mappedSessions);
        setTrainers(trainers ?? []);
        setAvailabilities(availabilities ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSessionSave = (newOrUpdatedSessions: Session[]) => {
    setSessions((current) => {
      const map = new Map(current.map((s) => [s.id, s]));
      newOrUpdatedSessions.forEach((s) => map.set(s.id, s));

      return Array.from(map.values());
    });

    setEditingSession(null);

    toast({
      title:
        newOrUpdatedSessions.length > 1
          ? "Recurring Sessions Created"
          : "Session Saved",
      description:
        newOrUpdatedSessions.length > 1
          ? `Successfully created ${newOrUpdatedSessions.length} sessions.`
          : "Your session has been successfully saved.",
    });
  };

  const handleSessionUpdate = async (
    updatedSession: Partial<Session> & { id: string }
  ) => {
    try {
      const payload: Partial<Session> = {};

      if ("trainerId" in updatedSession)
        payload.trainerId = updatedSession.trainerId;
      if ("batch" in updatedSession) payload.batch = updatedSession.batch;
      if ("sessionType" in updatedSession)
        payload.sessionType = updatedSession.sessionType;
      if ("date" in updatedSession) {
        payload.date =
          updatedSession.date instanceof Date
          ? updatedSession.date.toISOString()
          : updatedSession.date;
      }
      if ("duration" in updatedSession) payload.duration = updatedSession.duration;
      if ("location" in updatedSession) payload.location = updatedSession.location;
      if ("notes" in updatedSession) payload.notes = updatedSession.notes;
      if ("status" in updatedSession) payload.status = updatedSession.status;

      const updated = await updateSessionApi(updatedSession.id, payload as SessionPayload)


      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updated : s))
      );

      toast({
        title: "Session Updated",
        description: updatedSession.status
          ? `The session has been marked as ${updatedSession.status.toLowerCase()}.`
          : "Your changes have been saved.",
      });

      if (updatedSession.status) setIsDetailDialogOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not update the session in the database.",
      });
    }
  };

  const handleSessionClick = (session: Session) => {
    setViewingSession(session);
    setIsDetailDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingSession(null);
    setIsDialogOpen(true);
  };

  const sessionsToShow = useMemo(() => {
    const processed = processSessions(sessions);
    if (user?.role === "trainer") {
      return processed.filter((s) => String(s.trainerId) === String(user.id));
    }
    if (user?.role === "admin") {
      return filteredTrainerId === "all"
        ? processed
        : processed.filter((s) => String(s.trainerId) === String(filteredTrainerId));
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
      <div className="flex-1 w-full">
        {/* Page Header */}
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-700 to-indigo-900 pb-24 -mt-6 -mx-4 md:-mx-8 px-4 md:px-8 pt-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
           <div className="space-y-2">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/95">
               {user?.role === "admin" ? "Admin Dashboard" : "Dashboard"}
             </h2>
             <p className="text-indigo-100 text-lg font-medium max-w-2xl leading-relaxed">
               Welcome back, {user?.name}. You have <span className="text-white font-bold">{sessionsToShow.filter(s => s.status !== 'Completed' && s.status !== 'Cancelled').length}</span> active sessions scheduled for this week.
             </p>
           </div>
           
           {user?.role === "trainer" && (
             <Button
               onClick={handleAddNewClick} 
               className="bg-white text-indigo-700 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all font-semibold px-6 h-12 rounded-full border-0"
             >
               <PlusCircle className="mr-2 h-5 w-5" />
               Create Session
             </Button>
           )}
        </div>
      </div>

      <div className="flex-1 space-y-8 max-w-7xl mx-auto w-full px-0 -mt-16 relative z-10">

        {user?.role === "admin" && (
          <AdminDashboard
            sessions={sessions}
            trainers={trainers}
            availabilities={availabilities}
          />
        )}

        {user?.role === "trainer" && (
          <UpcomingSessionNotification
            sessions={sessionsToShow}
            trainers={trainers}
            currentTrainer={user}
          />
        )}

        <Tabs defaultValue="week" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-slate-100/50 border border-slate-200 p-1 h-auto">
              <TabsTrigger value="week" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                <CalendarDays className="mr-2 h-4 w-4" />
                Week View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Month View
              </TabsTrigger>
              <TabsTrigger value="agenda" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                <List className="mr-2 h-4 w-4" />
                Agenda View
              </TabsTrigger>
            </TabsList>

            {user?.role === "admin" && (
              <div className="p-4 border bg-card rounded-lg w-full sm:w-auto">
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

      {/* Trainer-only: Add/Edit session dialog */}
      {user?.role === "trainer" && (
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

      {/* Shared: Detail dialog */}
      {(user?.role === "trainer" || user?.role === "admin") && (
        <SessionDetailDialog
          isOpen={isDetailDialogOpen}
          setIsOpen={setIsDetailDialogOpen}
          session={viewingSession}
          onUpdateSession={handleSessionUpdate}
          trainers={trainers}
          currentUser={user}
        />
      )}
      </div>
    </AuthenticatedLayout>
  );
}
