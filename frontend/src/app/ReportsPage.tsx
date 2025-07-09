import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  CalendarClock,
  AlertTriangle,
  FileDown,
  Table as TableIcon, // <-- Avoid name clash!
} from 'lucide-react';
import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useAuth } from "../hooks/use-auth";
import { processSessions } from "../lib/session-utils";
import { type User, sessionTypes, sessionStatuses, type Session } from "../lib/types";
import { cn } from "../lib/utils";
import { fetchSessions } from "../api/sessions";
import { fetchTrainers } from "../api/availability";

const statusBadgeClasses: { [key: string]: string } = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
  Completed: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
  Cancelled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700',
  'Absent': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700',
};

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [filteredTrainerId, setFilteredTrainerId] = useState<string>("all");
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [filteredType, setFilteredType] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

useEffect(() => {
  if (!user?.id || !user.role) return;
  // For admin, fetch all; for trainer, fetch only their sessions
  const fetch = user.role === 'admin'
    ? fetchSessions()
    : fetchSessions(user.id);

  fetch.then(data => {
    const mapped = data.map(s => ({
      ...s,
      // Accept both .trainer and .trainerId, fallback to .trainer
      trainerId: String(s.trainerId ?? s.trainerId),
      date: typeof s.date === "string" ? new Date(s.date) : s.date,
    }));
    console.log("Fetched sessions:", mapped);
    setSessions(mapped);
  });

  fetchTrainers().then(setTrainers);
}, [user?.id, user?.role]);


  const processed = useMemo(() => {
    const mapped = sessions.map(s => ({
      ...s,
      date: typeof s.date === "string" ? new Date(s.date) : s.date,
    }));
    const result = processSessions(mapped);
    console.log("Processed sessions:", result);
    return result;
  }, [sessions]);

const sessionsToShow = useMemo(() => {
  let filtered = user?.role === 'admin'
    ? processed
    : processed.filter(s => String(s.trainerId) === String(user?.id));

  if (user?.role === 'admin' && filteredTrainerId !== "all") {
    filtered = filtered.filter(s => String(s.trainerId) === String(filteredTrainerId));
  }
  if (filteredStatus !== "all") {
    filtered = filtered.filter(s => s.status === filteredStatus);
  }
  if (filteredType !== "all") {
    filtered = filtered.filter(s => s.sessionType === filteredType);
  }

  const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  console.log("Sessions to show:", sorted);
  return sorted;
}, [
  user?.id,
  user?.role,
  processed,
  filteredTrainerId,
  filteredStatus,
  filteredType
]);


  const summaryStats = useMemo(() => {
    const source = user?.role === 'admin'
      ? processed
      : processed.filter(s => String(s.trainerId) === String(user?.id));
    const total = source.length;
    const completed = source.filter(s => s.status === 'Completed').length;
    const cancelled = source.filter(s => s.status === 'Cancelled').length;
    const absent = source.filter(s => s.status === 'Absent').length;

    const relevantTotal = total - cancelled;
    const completionRate = relevantTotal > 0 ? ((completed / relevantTotal) * 100) : 0;

    return { total, completed, cancelled, absent, completionRate };
  }, [processed, user]);

  const getTrainer = (trainerId: string) =>
  trainers.find(t => String(t.id) === String(trainerId));

  const handleExport = useCallback(() => {
    if (!sessionsToShow.length) return;

    const getTrainerName = (trainerId: string) => trainers.find(t => t.id === trainerId)?.name || 'N/A';

    const headers = user?.role === 'admin'
      ? ['Date', 'Time', 'Trainer', 'Batch', 'Session Type', 'Status', 'Notes']
      : ['Date', 'Time', 'Batch', 'Session Type', 'Status', 'Notes'];

    const csvContent = [
      headers.join(','),
      ...sessionsToShow.map(session => {
        let notesContent = session.notes || '';
        if (session.status === 'Absent') {
          notesContent = 'Trainer was absent.';
        }

        const row = [
          format(new Date(session.date), 'yyyy-MM-dd'),
          format(new Date(session.date), 'p'),
          user?.role === 'admin' ? `"${getTrainerName(session.trainerId)}"` : undefined,
          `"${session.batch}"`,
          session.sessionType,
          session.status,
          `"${notesContent.replace(/"/g, '""')}"`
        ].filter(Boolean);
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trainersamay-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sessionsToShow, user, trainers]);

  if (loading || !user) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <p>Loading...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Session Reports</h2>
            <p className="text-muted-foreground">
              View attendance history and session statistics.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absences</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.cancelled}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <CardTitle>Session History</CardTitle>
              <div className="flex gap-2 md:ml-auto flex-wrap items-center">
                {user.role === 'admin' && (
                  <Select value={filteredTrainerId} onValueChange={setFilteredTrainerId}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trainers</SelectItem>
                      {trainers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={filteredType} onValueChange={setFilteredType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {sessionTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filteredStatus} onValueChange={setFilteredStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {sessionStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} variant="outline" size="sm" disabled={sessionsToShow.length === 0}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    {user.role === 'admin' && <TableHead>Trainer</TableHead>}
                    <TableHead>Batch</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionsToShow.map((session) => {
                    const trainer = getTrainer(session.trainerId);
                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{format(new Date(session.date), 'PP')}</TableCell>
                        {user.role === 'admin' && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={trainer?.avatar} alt={trainer?.name} data-ai-hint="person avatar" />
                                <AvatarFallback>{trainer?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {trainer?.name}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{session.batch}</TableCell>
                        <TableCell>{session.sessionType}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn("capitalize font-semibold", statusBadgeClasses[session.status])}>
                            {session.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {sessionsToShow.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={user.role === 'admin' ? 5 : 4} className="h-24 text-center text-muted-foreground">
                        No sessions found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
