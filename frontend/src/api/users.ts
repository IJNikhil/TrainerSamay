import type { User } from "../lib/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift();
}
function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Token ${token}`;
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) headers["X-CSRFToken"] = csrfToken;
  return headers;
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users/`, { 
    headers: getHeaders(),
    credentials: "include" 
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
}

export async function createUser(
  user: Partial<User> & { password?: string; confirm_password?: string }
): Promise<User> {
  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return await res.json();
}

export async function updateUser(
  userId: string,
  user: Partial<User>
): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${userId}/`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function changePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/change-password/`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({
      current_password: data.currentPassword,
      new_password: data.newPassword,
      confirm_password: data.newPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.detail || err?.message || "Failed to change password");
  }
}
