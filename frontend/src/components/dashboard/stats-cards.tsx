"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Calendar, BarChart3, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  totalTrainers: number;
  totalSessions: number;
  attendanceRate: number;
  totalCompleted: number;
}

export default function StatsCards({
  totalTrainers,
  totalSessions,
  attendanceRate,
  totalCompleted,
}: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-[4px] border-l-indigo-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Active Trainers</CardTitle>
          <div className="p-2 bg-indigo-50 rounded-full">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalTrainers}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Currently active staff</p>
        </CardContent>
      </Card>

      <Card className="border-l-[4px] border-l-emerald-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Total Sessions</CardTitle>
          <div className="p-2 bg-emerald-50 rounded-full">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalSessions}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Scheduled and completed</p>
        </CardContent>
      </Card>

      <Card className="border-l-[4px] border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Attendance Rate</CardTitle>
          <div className="p-2 bg-blue-50 rounded-full">
             <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{attendanceRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Average across sessions</p>
        </CardContent>
      </Card>

      <Card className="border-l-[4px] border-l-orange-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Completed</CardTitle>
          <div className="p-2 bg-orange-50 rounded-full">
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{totalCompleted}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Successfully conducted</p>
        </CardContent>
      </Card>
    </div>
  );
}
