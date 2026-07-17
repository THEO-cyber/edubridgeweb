"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isSaved, saveOffline, removeOffline, offlineSupported } from "@/lib/offline";

/** Save this lesson for offline study, or remove the saved copy. */
export default function OfflineButton({
  lessonId,
  lessonTitle,
  courseId,
  courseTitle,
  courseSlug,
  token,
}: {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  token: string;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(offlineSupported());
    setSaved(isSaved(lessonId));
  }, [lessonId]);

  async function save() {
    setBusy(true);
    setMsg(null);
    setPct(null);
    try {
      const lesson = await api.get(`/lessons/${lessonId}`, { token });
      const videoId = lesson?.videos?.[0]?.id;
      if (!videoId) {
        setMsg("This lesson has no video to download yet.");
        return;
      }
      // No quality given → the API picks the smallest rendition to save data.
      const dl = await api.get(`/video-processing/download-url/${videoId}`, { token });
      if (!dl?.url) {
        setMsg("Download isn't available for this lesson.");
        return;
      }

      await saveOffline(
        { lessonId, lessonTitle, courseId, courseTitle, courseSlug, videoId },
        dl.url,
        dl.quality ?? "source",
        (p) => setPct(p.ratio === null ? null : Math.round(p.ratio * 100))
      );
      setSaved(true);
      setMsg("Saved for offline study");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save this lesson.");
    } finally {
      setBusy(false);
      setPct(null);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await removeOffline(lessonId);
      setSaved(false);
      setMsg("Removed from this device");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={saved ? remove : save}
        disabled={busy}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
          saved ? "border-green-300 bg-green-50 text-green-700" : "border-line text-ink hover:bg-soft"
        }`}
      >
        {busy ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {pct === null ? "Saving…" : `${pct}%`}
          </>
        ) : saved ? (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Available offline
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
            </svg>
            Download
          </>
        )}
      </button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}
