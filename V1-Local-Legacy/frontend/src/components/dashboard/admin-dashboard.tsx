"use client";

import { useMemo } from "react";
import type { Session, User, Availability } from "../../lib/types";
import StatsCards from "../dashboard/stats-cards";

interface AdminDashboardProps {
  sessions: Session[];
  trainers: User[];
  availabilities: Availability[];
}

export default function AdminDashboard({
  sessions,
  trainers,
  availabilities,
}: AdminDashboardProps) {
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const completed = sessions.filter((s) => s.status === "Completed").length;
    const scheduled = sessions.filter((s) => s.status === "Scheduled").length;
    const cancelled = sessions.filter((s) => s.status === "Cancelled").length;

    const attendanceRate =
      completed + scheduled > 0
        ? (completed / (completed + scheduled)) * 100
        : 0;

    return {
      totalSessions,
      totalTrainers: trainers.length,
      attendanceRate,
      totalCompleted: completed,
    };
  }, [sessions, trainers]);

  return (
    <div className="space-y-8">
      <StatsCards
        totalSessions={stats.totalSessions}
        totalTrainers={stats.totalTrainers}
        attendanceRate={stats.attendanceRate}
        totalCompleted={stats.totalCompleted}
      />
    </div>
  );
}
