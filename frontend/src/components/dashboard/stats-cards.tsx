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
      <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Total Trainers</CardTitle>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{totalTrainers}</div>
          <p className="text-xs text-slate-500 mt-1">Active staff members</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Total Sessions</CardTitle>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{totalSessions}</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled in history</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Attendance Rate</CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
             <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{attendanceRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1">Across all sessions</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">Completed</CardTitle>
          <div className="p-2 bg-orange-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{totalCompleted}</div>
          <p className="text-xs text-slate-500 mt-1">Successfully conducted</p>
        </CardContent>
      </Card>
    </div>
  );
}
