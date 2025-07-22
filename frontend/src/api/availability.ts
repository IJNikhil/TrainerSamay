import type { Availability, User } from "../lib/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift();
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Token ${token}`;
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) headers["X-CSRFToken"] = csrfToken;
  return headers;
}

export async function fetchAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_BASE}/availabilities/`, {
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch availabilities");
  const data = await res.json();
  return data.map((a: any) => ({
    ...a,
    trainerId: String(a.trainer ?? a.trainerId),
  }));
}

export async function fetchTrainers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/availabilities/trainers/`, {
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch trainers");
  return await res.json();
}

export async function fetchTrainerAvailabilities(trainerId: string): Promise<Availability[]> {
  const res = await fetch(`${API_BASE}/availabilities/${trainerId}/`, {
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch trainer availabilities");
  const data = await res.json();
  return data.map((a: any) => ({
    ...a,
    trainerId: String(a.trainer ?? a.trainerId),
  }));
}

export async function updateTrainerAvailabilities(trainerId: string, availabilities: Availability[]): Promise<void> {
  const res = await fetch(`${API_BASE}/availabilities/${trainerId}/`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(availabilities),
  });
  if (!res.ok) throw new Error("Failed to update trainer availabilities");
}
