import type { Session, SessionStatus } from "./types";
import { isPast, isToday } from "date-fns";

export function processSessions(sessions: Session[] = []): Session[] {
  return sessions.map(session => {
    const sessionDate =
      typeof session.date === "string" ? new Date(session.date) : session.date;

    const shouldBeAbsent =
      session.status === "Scheduled" && isPast(sessionDate) && !isToday(sessionDate);

    return {
      ...session,
      date: sessionDate,
      ...(shouldBeAbsent && { status: "Absent" as SessionStatus }),
    };
  });
}
