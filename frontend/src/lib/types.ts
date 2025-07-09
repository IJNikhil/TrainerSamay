export type Role = 'admin' | 'trainer';

export interface User {
  id: string; // Always string for consistency
  name: string;
  email: string;
  password: string;
  role: string;
  avatar?: string;
}

export const sessionTypes = ['Yoga', 'Strength', 'Cardio', 'Consultation'] as const;
export type SessionType = typeof sessionTypes[number];

export const sessionStatuses = ['Scheduled', 'Started','Completed', 'Cancelled', 'Absent'] as const;
export type SessionStatus = typeof sessionStatuses[number];

export interface Session {
  id: string;
  trainerId: string;
  batch: string;
  sessionType: SessionType;
  date: string | Date;
  duration: number;
  location: string;
  notes?: string;
  status: SessionStatus;
}

export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = typeof daysOfWeek[number];

export interface Availability {
  trainerId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export type AuditLogAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'SESSION_CREATED'
  | 'SESSION_UPDATED'
  | 'AVAILABILITY_UPDATED'
  | 'PROFILE_UPDATED';
