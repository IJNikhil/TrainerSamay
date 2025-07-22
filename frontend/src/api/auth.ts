const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift();
}

export function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Token ${token}`;
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) headers["X-CSRFToken"] = csrfToken;
  return headers;
}

export async function loginAndGetToken(email: string, password: string): Promise<{ user: any; token: string }> {
  const tokenRes = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password }),
  });

  if (!tokenRes.ok) {
    let errorMsg = "Token login failed";
    try {
      const error = await tokenRes.json();
      errorMsg = error.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const { token } = await tokenRes.json();

  const userRes = await fetch(`${API_BASE}/auth/me/`, {
    headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
  });

  if (userRes.ok) {
    const user = await userRes.json();
    return { user, token };
  }

  const fallbackRes = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!fallbackRes.ok) {
    throw new Error("Failed to get user info");
  }

  const data = await fallbackRes.json();
  return { user: data.user, token };
}

export async function loginWithSession(email: string, password: string): Promise<{ user: any; token: string }> {
  const sessionRes = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!sessionRes.ok) {
    let errorMsg = "Login failed";
    try {
      const error = await sessionRes.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const { user } = await sessionRes.json();

  const tokenRes = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to get token");
  }

  const { token } = await tokenRes.json();

  return { user, token };
}

export function logoutUser(): void {
  localStorage.removeItem("authToken");
}
