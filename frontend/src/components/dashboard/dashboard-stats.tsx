import { Card, CardContent } from "../ui/card";
import { Users, Calendar, Clock, CheckCircle, TrendingUp } from "lucide-react";
import type { Session, User } from "../../lib/types";

interface DashboardStatsProps {
  sessions: Session[];
  trainers: User[];
  userRole: "admin" | "trainer";
}

export function DashboardStats({ sessions, trainers, userRole }: DashboardStatsProps) {
  // Calculate Stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === "Completed").length;
  const scheduledSessions = sessions.filter(s => s.status === "Scheduled").length;
  
  // Calculate Hours (approximate duration)
  const totalMinutes = sessions.filter(s => s.status === "Completed").reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const activeTrainers = trainers.length; 

  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Calendar,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      label: userRole === "admin" ? "Active Trainers" : "Hours Trained",
      value: userRole === "admin" ? activeTrainers : totalHours,
      icon: userRole === "admin" ? Users : Clock,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Completed",
      value: completedSessions,
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Scheduled",
      value: scheduledSessions,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
