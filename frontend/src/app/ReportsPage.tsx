"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  CalendarClock,
  AlertTriangle,
  FileDown,
} from "lucide-react";

import AuthenticatedLayout from "../components/layouts/authenticated-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";

import { useAuth } from "../hooks/use-auth";
import { processSessions } from "../lib/session-utils";
import { cn } from "../lib/utils";
import { fetchSessions } from "../api/sessions";
import { fetchTrainers } from "../api/availability";

import type { Session, User } from "../lib/types";
import { sessionStatuses } from "../lib/types";

const statusBadgeClasses: Record<string, string> = {
  Scheduled:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
  Completed:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700",
  Cancelled:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
  Absent:
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700",
};

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [filteredTrainerId, setFilteredTrainerId] = useState<string>("all");
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [searchSessionType, setSearchSessionType] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user?.id || !user.role) return;

    const sessionRequest =
      user.role === "admin" ? fetchSessions() : fetchSessions(user.id);

    sessionRequest.then((data) => {
      const mapped = data.map((s) => ({
        ...s,
        trainerId: String(s.trainerId ?? s.trainerId),
        date: typeof s.date === "string" ? new Date(s.date) : s.date,
      }));
      setSessions(mapped);
    });

    fetchTrainers().then(setTrainers);
  }, [user?.id, user?.role]);

  const processed = useMemo(() => {
    return processSessions(
      sessions.map((s) => ({
        ...s,
        date: typeof s.date === "string" ? new Date(s.date) : s.date,
      }))
    );
  }, [sessions]);

  const sessionsToShow = useMemo(() => {
    let filtered =
      user?.role === "admin"
        ? processed
        : processed.filter((s) => String(s.trainerId) === String(user?.id));

    if (user?.role === "admin" && filteredTrainerId !== "all") {
      filtered = filtered.filter(
        (s) => String(s.trainerId) === String(filteredTrainerId)
      );
    }

    if (filteredStatus !== "all") {
      filtered = filtered.filter((s) => s.status === filteredStatus);
    }

    if (searchSessionType.trim() !== "") {
      const lower = searchSessionType.toLowerCase();
      filtered = filtered.filter((s) =>
        s.sessionType.toLowerCase().includes(lower)
      );
    }

    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [user?.id, user?.role, processed, filteredTrainerId, filteredStatus, searchSessionType]);

  const summaryStats = useMemo(() => {
    const source =
      user?.role === "admin"
        ? processed
        : processed.filter((s) => String(s.trainerId) === String(user?.id));

    const total = source.length;
    const completed = source.filter((s) => s.status === "Completed").length;
    const cancelled = source.filter((s) => s.status === "Cancelled").length;
    const absent = source.filter((s) => s.status === "Absent").length;

    const relevantTotal = total - cancelled;
    const completionRate = relevantTotal > 0 ? (completed / relevantTotal) * 100 : 0;

    return { total, completed, cancelled, absent, completionRate };
  }, [processed, user?.id, user?.role]);

  const getTrainer = (trainerId: string) =>
    trainers.find((t) => String(t.id) === String(trainerId));

const handleExport = useCallback(() => {
  if (!sessionsToShow.length) return;

  const headers =
    user?.role === "admin"
      ? [
          "Date",
          "Time",
          "Trainer",
          "Batch",
          "Session Type",
          "Status",
          "Duration",
          "Location",
          "Notes",
        ]
      : [
          "Date",
          "Time",
          "Batch",
          "Session Type",
          "Status",
          "Duration",
          "Location",
          "Notes",
        ];

  const rows = sessionsToShow.map((session) => {
    const trainer = getTrainer(session.trainerId);
    const notes =
      session.status === "Absent"
        ? "Trainer was absent."
        : session.notes?.replace(/"/g, '""') || "";

    const row: (string | undefined)[] = [
      format(new Date(session.date), "yyyy-MM-dd"),
      format(new Date(session.date), "p"),
      user?.role === "admin" ? trainer?.name : undefined,
      session.batch,
      session.sessionType,
      session.status,
      String(session.duration || ""),
      session.location || "",
      `"${notes}"`,
    ];

    return row.filter((v) => typeof v !== "undefined").join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  link.download = `trainersamay-detailed-report-${new Date()
    .toISOString()
    .split("T")[0]}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}, [sessionsToShow, trainers, user?.role]);


  if (loading || !user) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 p-8">
          <p>Loading...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Reports</h2>
          <p className="text-muted-foreground">
            View attendance history and session statistics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Total Sessions
      </CardTitle>
      <CalendarClock className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{summaryStats.total}</div>
      <p className="text-xs text-muted-foreground">All scheduled sessions</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Completed
      </CardTitle>
      <CheckCircle className="h-5 w-5 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{summaryStats.completed}</div>
      <p className="text-xs text-muted-foreground">Sessions successfully conducted</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Absences
      </CardTitle>
      <AlertTriangle className="h-5 w-5 text-amber-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{summaryStats.absent}</div>
      <p className="text-xs text-muted-foreground">Trainer or trainee was absent</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Cancelled
      </CardTitle>
      <XCircle className="h-5 w-5 text-red-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{summaryStats.cancelled}</div>
      <p className="text-xs text-muted-foreground">Cancelled by trainer or admin</p>
    </CardContent>
  </Card>
</div>

        {/* Filters + Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <CardTitle>Session History</CardTitle>
              <div className="flex flex-wrap gap-2 items-center justify-end w-full sm:w-auto">
                {user.role === "admin" && (
                  <Select value={filteredTrainerId} onValueChange={setFilteredTrainerId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trainers</SelectItem>
                      {trainers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={filteredStatus} onValueChange={setFilteredStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {sessionStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  placeholder="Search Session Type"
                  value={searchSessionType}
                  onChange={(e) => setSearchSessionType(e.target.value)}
                  className="w-[220px]"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={sessionsToShow.length === 0}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  {user.role === "admin" && <TableHead>Trainer</TableHead>}
                  <TableHead>Batch</TableHead>
                  <TableHead>Session Name/Type</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsToShow.length > 0 ? (
                  sessionsToShow.map((session) => {
                    const trainer = getTrainer(session.trainerId);
                    return (
                      <TableRow key={session.id}>
                        <TableCell>{format(new Date(session.date), "PP")}</TableCell>
                        {user.role === "admin" && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={trainer?.avatar} />
                                <AvatarFallback>
                                  {trainer?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {trainer?.name}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{session.batch}</TableCell>
                        <TableCell>{session.sessionType}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize font-semibold",
                              statusBadgeClasses[session.status]
                            )}
                          >
                            {session.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={user.role === "admin" ? 5 : 4}
                      className="text-center text-muted-foreground py-6"
                    >
                      No sessions found for the applied filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
