const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/** Get auth token from localStorage */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/** Helper to get a cookie value by name (used for CSRF token) */
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift();
}

/** Get common headers for API requests */
export function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Token ${token}`;
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) headers["X-CSRFToken"] = csrfToken;
  return headers;
}

/** Login and get DRF token - FIXED VERSION */
export async function loginAndGetToken(
  email: string,
  password: string
): Promise<{ user: any; token: string }> {
  console.log("Attempting login for:", email);
  
  // Get token first
  const response = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password }),
  });
  
  if (!response.ok) {
    let errorMsg = "Token login failed";
    try {
      const error = await response.json();
      errorMsg = error.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  
  const data = await response.json();
  console.log("Token received:", data.token);

  // CRITICAL FIX: Get current user info using the token
  // Don't filter by email - get the authenticated user directly
  const userRes = await fetch(`${API_BASE}/auth/me/`, {
    headers: { 
      Authorization: `Token ${data.token}`,
      "Content-Type": "application/json"
    },
  });
  
  // If /auth/me/ doesn't exist, create it OR use a different approach
  if (!userRes.ok) {
    // Fallback: Use the session-based login that returns user data
    const sessionResponse = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!sessionResponse.ok) {
      throw new Error("Failed to get user info");
    }
    
    const sessionData = await sessionResponse.json();
    console.log("User from session login:", sessionData.user);
    
    return { user: sessionData.user, token: data.token };
  }
  
  const user = await userRes.json();
  console.log("Authenticated user:", user);
  
  return { user, token: data.token };
}

/** Alternative: Use session-based login that returns user data directly */
export async function loginWithSession(
  email: string,
  password: string
): Promise<{ user: any; token: string }> {
  console.log("Session login for:", email);
  
  // Use your existing session login that returns user data
  const sessionResponse = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!sessionResponse.ok) {
    let errorMsg = "Login failed";
    try {
      const error = await sessionResponse.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  
  const sessionData = await sessionResponse.json();
  console.log("Session user:", sessionData.user);
  
  // Get token separately
  const tokenResponse = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password }),
  });
  
  if (!tokenResponse.ok) {
    throw new Error("Failed to get token");
  }
  
  const tokenData = await tokenResponse.json();
  
  return { user: sessionData.user, token: tokenData.token };
}

/** Logout (token-based) */
export function logoutUser() {
  localStorage.removeItem('authToken');
}