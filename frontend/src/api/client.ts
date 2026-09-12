export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseErrorMessage(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  if ("error" in data) {
    if (typeof data.error === "string") {
      return data.error;
    }
    if (Array.isArray(data.error)) {
      return data.error
        .map((issue: { message?: string }) => issue.message ?? "")
        .filter(Boolean)
        .join(", ");
    }
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  return null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Server is unavailable. Check your connection");
  }

  if (!response.ok) {
    let message = getDefaultErrorMessage(response.status);

    try {
      const data: unknown = await response.json();
      message = parseErrorMessage(data) ?? message;
    } catch {}

    throw new ApiError(response.status, message);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400: return "Invalid request data";
    case 401: return "Invalid credentials";
    case 409: return "This username is already taken";
    case 502:
    case 503: return "Server is temporarily unavailable";
    default:  return `Request failed (${status})`;
  }
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
