// API client for the EduBridge backend (through the Cloudflare proxy).
// Handles the { success, data, timestamp } response envelope in one place.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://edubridge-proxy.michaelrodri091.workers.dev/api/v1";

function unwrap(json: any): any {
  if (
    json &&
    typeof json === "object" &&
    "data" in json &&
    ("success" in json || "timestamp" in json)
  ) {
    return json.data;
  }
  return json;
}

export function pickList(payload: any, keys: string[]): any[] {
  const p = unwrap(payload);
  if (Array.isArray(p)) return p;
  if (p && typeof p === "object") {
    for (const k of keys) if (Array.isArray(p[k])) return p[k];
  }
  return [];
}

type Opts = { token?: string; body?: unknown; cache?: RequestCache; revalidate?: number };

async function request(method: string, path: string, opts: Opts = {}): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const init: RequestInit & { next?: { revalidate?: number } } = {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  };
  if (opts.cache) init.cache = opts.cache;
  if (opts.revalidate !== undefined) init.next = { revalidate: opts.revalidate };

  const res = await fetch(`${API_BASE}${path}`, init);
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const msg =
      (json && (json.message || json.error)) || `Request failed (${res.status})`;
    throw new ApiError(typeof msg === "string" ? msg : "Request failed", res.status);
  }
  return unwrap(json);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const api = {
  get: (path: string, opts?: Opts) => request("GET", path, opts),
  post: (path: string, body?: unknown, opts?: Opts) => request("POST", path, { ...opts, body }),
  patch: (path: string, body?: unknown, opts?: Opts) => request("PATCH", path, { ...opts, body }),
  del: (path: string, opts?: Opts) => request("DELETE", path, opts),
};

// ── Public data helpers (server-rendered, revalidated for SEO + freshness) ──

export async function getCourses(params: Record<string, string> = {}): Promise<any[]> {
  try {
    const qs = new URLSearchParams({ limit: "24", ...params }).toString();
    const data = await request("GET", `/courses?${qs}`, { revalidate: 120 });
    return pickList(data, ["courses", "items", "results"]);
  } catch {
    return []; // never fail the page/build if the API is momentarily down
  }
}

export async function getCourseBySlug(slug: string): Promise<any | null> {
  try {
    return await request("GET", `/courses/slug/${slug}`, { revalidate: 120 });
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const data = await request("GET", `/search/categories`, { revalidate: 600 });
    return pickList(data, ["categories", "items"]);
  } catch {
    return [];
  }
}
