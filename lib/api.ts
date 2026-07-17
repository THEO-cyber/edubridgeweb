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

/**
 * Turns an API error body into something worth showing a person.
 *
 * The API reports field problems as `{ message: "Validation failed", errors: [...] }`
 * — the useful part is `errors`, so read that first. Reading `message` first
 * tells a learner only that something "failed", never what to change.
 */
function errorMessage(json: any, status: number): string {
  const errors = json?.errors;
  if (Array.isArray(errors) && errors.length) {
    return errors.map((e: any) => (typeof e === "string" ? e : e?.message ?? String(e))).join("\n");
  }
  const msg = json?.message ?? json?.error;
  if (typeof msg === "string" && msg && msg.toLowerCase() !== "validation failed") return msg;
  if (Array.isArray(msg) && msg.length) return msg.join("\n");

  switch (status) {
    case 401: return "Your email or password is incorrect.";
    case 403: return "You don't have access to this.";
    case 404: return "We couldn't find what you were looking for.";
    case 409: return "That already exists.";
    case 429: return "Too many attempts. Please wait a moment and try again.";
    default:  return status >= 500
      ? "EduBridge is having a problem right now. Please try again shortly."
      : "Something went wrong. Please check your details and try again.";
  }
}

/** Network failures surface as "Failed to fetch", which means nothing to a learner. */
function isNetworkError(e: unknown): boolean {
  return e instanceof TypeError || /fetch|network|aborted/i.test(String((e as Error)?.message ?? ""));
}

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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch (e) {
    if (isNetworkError(e)) {
      // Usually offline — but it is also what a cold-starting backend looks like.
      throw new ApiError(
        "Can't reach EduBridge. Check your internet connection and try again.",
        0
      );
    }
    throw e;
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new ApiError(errorMessage(json, res.status), res.status);
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
    // Short window on purpose: categories are edited from the super-admin
    // console, and a long cache makes a change there look like it failed. The
    // API caches this list itself and drops that cache on every write, so
    // asking more often is cheap.
    const data = await request("GET", `/search/categories`, { revalidate: 30 });
    return pickList(data, ["categories", "items"]);
  } catch {
    return [];
  }
}
