import type { Session, SessionPayload } from "../lib/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://trainer-samay-api.onrender.com/api";



type SessionUpdatePayload = Partial<SessionPayload>;

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

function toBackendPayload(data: SessionPayload | SessionUpdatePayload) {
  const { trainerId, ...rest } = data;
  return {
    ...rest,
    ...(trainerId !== undefined ? { trainer: trainerId } : {})
  };
}

export async function fetchSessions(trainerId?: string): Promise<Session[]> {
  const url = trainerId ? `${API_BASE}/sessions/?trainer=${trainerId}` : `${API_BASE}/sessions/`;
  const res = await fetch(url, {
    headers: getHeaders(),
    credentials: "include"
  });
  if (!res.ok) {
    let errorMsg = "Failed to fetch sessions";
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch { }
    throw new Error(errorMsg);
  }
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("API did not return a session list");
  return data.map((s: any) => ({
    ...s,
    trainerId: String(s.trainer ?? s.trainerId),
    date: new Date(s.date)
  }));
}

export async function createSession(data: SessionPayload): Promise<Session> {
  const backendData = toBackendPayload(data);
  const res = await fetch(`${API_BASE}/sessions/`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(backendData)
  });
  if (!res.ok) {
    let errorMsg = "Failed to create session";
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch {
      const error = await res.text();
      if (error) errorMsg = error;
    }
    throw new Error(errorMsg);
  }
  const result = await res.json();
  return {
    ...result,
    trainerId: String(result.trainer ?? result.trainerId),
    date: new Date(result.date)
  };
}

export async function updateSessionApi(
  sessionId: string,
  data: SessionUpdatePayload
): Promise<Session> {
  let backendData = { ...data };
  if (
    backendData.status === "Scheduled" &&
    backendData.date &&
    backendData.duration !== undefined
  ) {
    const scheduledDate = new Date(backendData.date);
    const duration = Number(backendData.duration);
    let waitingMinutes = duration <= 60 ? duration * 0.5 : 30;
    const cutoffTime = new Date(scheduledDate.getTime() + waitingMinutes * 60000);
    const now = new Date();
    if (now > cutoffTime) {
      backendData.status = "Absent";
    }
  }

  backendData = toBackendPayload(backendData);

  const res = await fetch(`${API_BASE}/sessions/${sessionId}/`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(backendData)
  });

  if (!res.ok) {
    let errorMsg = "Failed to update session";
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch {
      const error = await res.text();
      if (error) errorMsg = error;
    }
    throw new Error(errorMsg);
  }

  const result = await res.json();
  return {
    ...result,
    trainerId: String(result.trainer ?? result.trainerId),
    date: new Date(result.date)
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include"
  });

  if (!res.ok) {
    let errorMsg = "Failed to delete session";
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch {
      const error = await res.text();
      if (error) errorMsg = error;
    }
    throw new Error(errorMsg);
  }
}
