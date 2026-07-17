// Offline lesson storage for the PWA.
//
// Video blobs live in the Cache Storage API (not localStorage/IndexedDB) because
// it is built for exactly this: large opaque responses, served back as a real
// Response the <video> element can stream with range requests. A small JSON
// registry in localStorage records what is saved.

const CACHE = "edubridge-lessons-v1";
const REGISTRY = "eb_offline_lessons";

export type OfflineLesson = {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  url: string; // cache key
  bytes: number;
  quality: string;
  savedAt: string;
};

export type SaveProgress = {
  received: number;
  total: number | null;
  ratio: number | null;
  done?: boolean;
  error?: string;
};

export const offlineSupported = () =>
  typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;

// ── registry ────────────────────────────────────────────────────────────────

export function listOffline(): OfflineLesson[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REGISTRY) || "[]");
  } catch {
    return [];
  }
}

function writeRegistry(items: OfflineLesson[]) {
  localStorage.setItem(REGISTRY, JSON.stringify(items));
}

export function isSaved(lessonId: string): boolean {
  return listOffline().some((l) => l.lessonId === lessonId);
}

export function totalBytes(): number {
  return listOffline().reduce((n, l) => n + (l.bytes || 0), 0);
}

// ── save ────────────────────────────────────────────────────────────────────

/**
 * Streams a lesson into Cache Storage, reporting progress. The response is
 * rebuilt from the streamed chunks so we can measure it — `cache.add()` would
 * give no progress at all, which is unusable on a slow connection.
 */
export async function saveOffline(
  meta: Omit<OfflineLesson, "url" | "bytes" | "savedAt" | "quality"> & { videoId: string },
  downloadUrl: string,
  quality: string,
  onProgress?: (p: SaveProgress) => void
): Promise<boolean> {
  if (!offlineSupported()) throw new Error("This browser cannot store lessons offline.");

  const res = await fetch(downloadUrl);
  if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`);

  const total = Number(res.headers.get("content-length")) || null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.({ received, total, ratio: total ? received / total : null });
  }

  const blob = new Blob(chunks as BlobPart[], {
    type: res.headers.get("content-type") || "video/mp4",
  });

  // A same-origin key keeps the entry addressable after the presigned URL expires.
  const key = `/offline/lesson/${meta.lessonId}.mp4`;
  const cache = await caches.open(CACHE);
  await cache.put(
    key,
    new Response(blob, {
      headers: {
        "Content-Type": blob.type,
        "Content-Length": String(blob.size),
        "Accept-Ranges": "bytes",
      },
    })
  );

  const items = listOffline().filter((l) => l.lessonId !== meta.lessonId);
  items.push({
    lessonId: meta.lessonId,
    lessonTitle: meta.lessonTitle,
    courseId: meta.courseId,
    courseTitle: meta.courseTitle,
    courseSlug: meta.courseSlug,
    url: key,
    bytes: blob.size,
    quality,
    savedAt: new Date().toISOString(),
  });
  writeRegistry(items);

  onProgress?.({ received, total, ratio: 1, done: true });
  return true;
}

/** Object URL for a saved lesson, or null. Caller must revokeObjectURL when done. */
export async function offlineObjectUrl(lessonId: string): Promise<string | null> {
  if (!offlineSupported()) return null;
  const entry = listOffline().find((l) => l.lessonId === lessonId);
  if (!entry) return null;
  const cache = await caches.open(CACHE);
  const res = await cache.match(entry.url);
  if (!res) {
    // Cache was evicted by the browser — keep the registry honest.
    writeRegistry(listOffline().filter((l) => l.lessonId !== lessonId));
    return null;
  }
  return URL.createObjectURL(await res.blob());
}

export async function removeOffline(lessonId: string): Promise<void> {
  const entry = listOffline().find((l) => l.lessonId === lessonId);
  if (entry && offlineSupported()) {
    const cache = await caches.open(CACHE);
    await cache.delete(entry.url);
  }
  writeRegistry(listOffline().filter((l) => l.lessonId !== lessonId));
}

export async function removeAllOffline(): Promise<void> {
  if (offlineSupported()) await caches.delete(CACHE);
  writeRegistry([]);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 MB";
  const mb = 1024 * 1024;
  if (bytes < mb) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * mb) return `${(bytes / mb).toFixed(1)} MB`;
  return `${(bytes / (1024 * mb)).toFixed(2)} GB`;
}
