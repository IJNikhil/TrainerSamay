"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Availability, User } from "../../lib/types";
import { daysOfWeek } from "../../lib/types";
import { formatTimeString } from "../../lib/utils";

interface AvailabilityViewProps {
  availabilities: Availability[];
  trainers: User[];
}

export default function AvailabilityView({ availabilities, trainers }: AvailabilityViewProps) {
  const trainerSchedules = useMemo(() => {
    return trainers
      .map((trainer) => {
        const schedule: { [key: string]: string } = {};
        daysOfWeek.forEach((day) => {
          const avail = availabilities.find(
            (a) => String(a.trainerId) === String(trainer.id) && a.day === day
          );
          schedule[day] = avail
            ? `${formatTimeString(avail.startTime)} - ${formatTimeString(avail.endTime)}`
            : "-";
        });
        return { trainer, schedule };
      })
      .sort((a, b) => a.trainer.name.localeCompare(b.trainer.name));
  }, [availabilities, trainers]);

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-white/50 pb-6">
        <CardTitle className="text-xl font-bold text-slate-800">Weekly Availability Matrix</CardTitle>
        <CardDescription className="text-slate-500">
          View all trainer schedules in a weekly matrix. The table is horizontally scrollable if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full whitespace-nowrap">
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-slate-50/50">
                <TableHead className="w-[200px] sticky left-0 bg-slate-50 z-20 font-semibold text-slate-700 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)]">Trainer</TableHead>
                {daysOfWeek.map((day) => (
                  <TableHead key={day} className="text-center font-semibold text-slate-700 bg-slate-50">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainerSchedules.map(({ trainer, schedule }) => (
                <TableRow key={trainer.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="font-medium sticky left-0 bg-white z-10 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage
                          src={trainer.avatar}
                          alt={trainer.name}
                          data-ai-hint="person avatar"
                        />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">{trainer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-slate-900">{trainer.name}</span>
                    </div>
                  </TableCell>
                  {daysOfWeek.map((day) => (
                    <TableCell key={day} className="text-center font-mono text-sm text-slate-600">
                      {schedule[day] !== "-" ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-semibold border border-emerald-100">
                          {schedule[day]}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {trainerSchedules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={daysOfWeek.length + 1}
                    className="h-32 text-center text-slate-500"
                  >
                    No trainers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
