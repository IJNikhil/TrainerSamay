"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";

import { useAuth } from "../hooks/use-auth";
import { processSessions } from "../lib/session-utils";
import { cn } from "../lib/utils";
import { fetchSessions } from "../api/sessions";
import { fetchTrainers } from "../api/availability";

import type { Session, User } from "../lib/types";

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
      <div className="flex-1 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="border-b border-slate-200/60 pb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Session Reports</h2>
          <p className="text-slate-500 mt-1">
             View attendance history, status analytics, and detailed session logs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-[4px] border-l-slate-500 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                Total Sessions
            </CardTitle>
            <div className="p-2 bg-slate-100 rounded-full">
                <CalendarClock className="h-4 w-4 text-slate-600" />
            </div>
            </CardHeader>
            <CardContent>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{summaryStats.total}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Recorded in period</p>
            </CardContent>
        </Card>

        <Card className="border-l-[4px] border-l-emerald-500 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                Completed
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            </CardHeader>
            <CardContent>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{summaryStats.completed}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Successfully conducted</p>
            </CardContent>
        </Card>

        <Card className="border-l-[4px] border-l-amber-500 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                Absent/Cancelled
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-full">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            </CardHeader>
            <CardContent>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {summaryStats.cancelled + summaryStats.absent}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Missed sessions</p>
            </CardContent>
        </Card>

        <Card className="border-l-[4px] border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                Completion Rate
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-full">
                <FileDown className="h-4 w-4 text-blue-600" />
            </div>
            </CardHeader>
            <CardContent>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {summaryStats.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Success rate</p>
            </CardContent>
        </Card>
        </div>

        {/* Filters + Table */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
             {/* Styled Inputs/Filters */}
            <div className="flex-1">
               <Input
                 placeholder="Search by Session Type..."
                 value={searchSessionType}
                 onChange={(e) => setSearchSessionType(e.target.value)}
                 className="h-10 bg-white border-slate-200 shadow-sm focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400/80"
               />
            </div>
            
             <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium"
              value={filteredStatus}
              onChange={(e) => setFilteredStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Absent">Absent</option>
            </select>

            {user?.role === "admin" && (
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium"
                value={filteredTrainerId}
                onChange={(e) => setFilteredTrainerId(e.target.value)}
              >
                <option value="all">All Trainers</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            <Button onClick={handleExport} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="pl-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Date</TableHead>
                  <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Time</TableHead>
                  {user?.role === "admin" && <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Trainer</TableHead>}
                  <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Batch</TableHead>
                  <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Type</TableHead>
                  <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Status</TableHead>
                  <TableHead className="py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsToShow.map((session) => {
                  const sessionDate = new Date(session.date);
                  const trainer = getTrainer(session.trainerId);

                  return (
                    <TableRow key={session.id} className="group hover:bg-indigo-50/30 transition-colors h-16 border-slate-100">
                      <TableCell className="pl-6 font-medium text-slate-700">
                        {format(sessionDate, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {format(sessionDate, "h:mm a")}
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                {trainer?.name || "Unknown"}
                            </div>
                        </TableCell>
                      )}
                      <TableCell>
                          <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-slate-700 font-medium font-mono text-xs">
                              {session.batch}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">{session.sessionType}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium border shadow-none",
                            session.status === "Scheduled" && "bg-blue-50 text-blue-700 border-blue-200",
                            session.status === "Completed" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            session.status === "Cancelled" && "bg-amber-50 text-amber-700 border-amber-200",
                            session.status === "Absent" && "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-500 text-xs italic">
                        {session.notes || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sessionsToShow.length === 0 && (
                   <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                      No sessions found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
