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
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability Matrix</CardTitle>
        <CardDescription>
          View all trainer schedules in a weekly matrix. The table is horizontally scrollable if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-card z-10">Trainer</TableHead>
                {daysOfWeek.map((day) => (
                  <TableHead key={day} className="text-center">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainerSchedules.map(({ trainer, schedule }) => (
                <TableRow key={trainer.id}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={trainer.avatar}
                          alt={trainer.name}
                          data-ai-hint="person avatar"
                        />
                        <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{trainer.name}</span>
                    </div>
                  </TableCell>
                  {daysOfWeek.map((day) => (
                    <TableCell key={day} className="text-center font-mono">
                      {schedule[day]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {trainerSchedules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={daysOfWeek.length + 1}
                    className="h-24 text-center text-muted-foreground"
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
