"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle,
  Calendar as CalendarIcon,
  List,
  CalendarDays,
  LayoutGrid,
} from "lucide-react";
import { format, isSameDay } from "date-fns";

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
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";

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
  
  // Dashboard State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("calendar");

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

  // Derived state for the Sidebar (Selected Day)
  const selectedDaySessions = useMemo(() => {
    return sessionsToShow.filter(s => isSameDay(new Date(s.date), selectedDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessionsToShow, selectedDate]);

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
      <div className="flex-1 w-full flex flex-col min-h-screen">
        
      {/* Premium Hero Header */}
      <div className="relative bg-gradient-to-r from-indigo-700 to-indigo-900 pb-32 -mt-6 -mx-4 md:-mx-8 px-4 md:px-8 pt-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full relative z-10">
           <div className="space-y-1">
             <div className="flex items-center gap-2 text-indigo-200">
               <LayoutGrid className="h-5 w-5" />
               <span className="text-sm font-medium uppercase tracking-wider">Executive Dashboard</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
               {user?.role === "admin" ? "Overview" : `Hello, ${user?.name}`}
             </h2>
             <p className="text-indigo-100 text-lg font-medium max-w-2xl pt-2">
                You have <span className="text-white font-bold text-xl border-b-2 border-indigo-400 mx-1">{sessionsToShow.filter(s => s.status !== 'Completed' && s.status !== 'Cancelled').length}</span> active sessions.
             </p>
           </div>
           
           {user?.role === "trainer" && (
             <Button
               onClick={handleAddNewClick} 
               className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl hover:shadow-2xl transition-all font-bold px-8 h-14 rounded-2xl text-lg border-0"
             >
               <PlusCircle className="mr-2 h-5 w-5" />
               New Session
             </Button>
           )}
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <CalendarIcon className="h-64 w-64 text-white" />
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 -mt-24 relative z-20 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-sm w-fit">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-1">
              <TabsTrigger 
                value="calendar" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 text-indigo-100 hover:bg-white/10 px-6 py-2.5 rounded-lg transition-all"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Month
              </TabsTrigger>
              <TabsTrigger 
                value="week" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 text-indigo-100 hover:bg-white/10 px-6 py-2.5 rounded-lg transition-all"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Week
              </TabsTrigger>
              <TabsTrigger 
                value="agenda" 
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 text-indigo-100 hover:bg-white/10 px-6 py-2.5 rounded-lg transition-all"
              >
                <List className="mr-2 h-4 w-4" />
                Agenda
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Content Area (Calendar) - Spans 8 cols */}
            <div className="lg:col-span-8 space-y-6">
              {user?.role === "admin" && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                     <TrainerFilter
                        trainers={trainers}
                        selectedTrainerId={filteredTrainerId}
                        onTrainerChange={setFilteredTrainerId}
                      />
                  </div>
              )}

              <div className="min-h-[600px] shadow-xl rounded-xl bg-white border border-slate-200/60 overflow-hidden">
                <TabsContent value="week" className="m-0 h-full">
                  <WeekView
                    sessions={sessionsToShow}
                    onSessionClick={handleSessionClick}
                    trainers={trainers}
                  />
                </TabsContent>
                <TabsContent value="calendar" className="m-0 h-full">
                  <CalendarView
                    sessions={sessionsToShow}
                    onSessionClick={handleSessionClick}
                    onDateClick={(date) => setSelectedDate(date)}
                    selectedDate={selectedDate}
                  />
                </TabsContent>
                <TabsContent value="agenda" className="m-0 h-full p-6">
                  <AgendaView
                    sessions={sessionsToShow}
                    onSessionClick={handleSessionClick}
                    trainers={trainers}
                  />
                </TabsContent>
              </div>
            </div>

            {/* Smart Sidebar - Spans 4 cols */}
            <div className="lg:col-span-4 space-y-6 sticky top-6">
               
               {/* 1. Next Up Widget */}
               {user?.role === "trainer" && (
                 <UpcomingSessionNotification
                   sessions={sessionsToShow}
                 />
               )}

               {/* 2. Selected Day Agenda Panel */}
               <Card className="border-slate-200 shadow-md bg-white overflow-hidden flex flex-col max-h-[600px]">
                 <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                   <div className="flex items-center justify-between">
                     <CardTitle className="text-lg font-bold text-slate-800">
                       {format(selectedDate, "EEEE, MMM do")}
                     </CardTitle>
                     {isSameDay(selectedDate, new Date()) && (
                       <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 shadow-none">Today</Badge>
                     )}
                   </div>
                   <p className="text-sm text-slate-500 font-medium">
                     {selectedDaySessions.length} sessions scheduled
                   </p>
                 </CardHeader>
                 <ScrollArea className="flex-1 p-4 bg-slate-50/30">
                   {selectedDaySessions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDaySessions.map(session => (
                           <div 
                             key={session.id}
                             onClick={() => handleSessionClick(session)}
                             className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                           >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                  {session.sessionType}
                                </h4>
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {format(new Date(session.date), "p")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                 <span className="font-medium text-slate-600">{session.batch}</span>
                                 <span>•</span>
                                 <span>{session.duration} min</span>
                              </div>
                           </div>
                        ))}
                      </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p>No sessions on this day.</p>
                        {user?.role === "trainer" && (
                          <Button 
                            variant="link" 
                            onClick={handleAddNewClick}
                            className="text-indigo-600 mt-2"
                          >
                            Schedule one now
                          </Button>
                        )}
                     </div>
                   )}
                 </ScrollArea>
                 <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <Button onClick={handleAddNewClick} className="w-full bg-white border-dashed border-2 border-slate-300 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50">
                       <PlusCircle className="mr-2 h-4 w-4" /> Add to {format(selectedDate, "MMM d")}
                    </Button>
                 </div>
               </Card>

               {/* 3. Admin Stats (if admin) or Quick Actions */}
               {user?.role === "admin" && (
                 <AdminDashboard
                   sessions={sessions}
                   trainers={trainers}
                   availabilities={availabilities}
                 />
               )}
            </div>

          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
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
