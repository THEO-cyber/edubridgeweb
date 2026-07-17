"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { offlineObjectUrl, isSaved } from "@/lib/offline";

type State = "loading" | "ready" | "none";

/**
 * Lesson player.
 *
 * Order of preference:
 *   1. a copy saved offline  → plays with no network at all
 *   2. adaptive HLS          → quality follows the connection instead of stalling
 *   3. a plain MP4           → direct-play fallback when no renditions exist
 *
 * Chrome/Firefox/Edge cannot play HLS natively, so hls.js is loaded on demand.
 * Safari plays HLS itself and is given the URL directly.
 */
export default function LessonVideo({
  lessonId,
  token,
  title,
}: {
  lessonId: string;
  token: string;
  title: string;
}) {
  const [state, setState] = useState<State>("loading");
  const [offline, setOffline] = useState(false);
  const [adaptive, setAdaptive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;

    const cleanupObjectUrl = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    (async () => {
      setState("loading");
      setOffline(false);
      setAdaptive(false);
      cleanupObjectUrl();

      // 1 ── saved offline?
      try {
        if (isSaved(lessonId)) {
          const localUrl = await offlineObjectUrl(lessonId);
          if (localUrl && !cancelled) {
            objectUrlRef.current = localUrl;
            if (videoRef.current) videoRef.current.src = localUrl;
            setOffline(true);
            setState("ready");
            return;
          }
        }
      } catch {
        /* fall through to network */
      }

      // 2 ── ask the API how to play it
      try {
        const lesson = await api.get(`/lessons/${lessonId}`, { token });
        const videoId = lesson?.videos?.[0]?.id;
        const direct = lesson?.videoUrl;

        if (videoId) {
          const info = await api.get(`/video-processing/playback/${videoId}`, { token });
          const hlsUrl: string | undefined = info?.hlsUrl;
          const mp4Url: string | undefined = info?.mp4Url;

          if (hlsUrl && videoRef.current) {
            const video = videoRef.current;
            const canPlayNatively = video.canPlayType("application/vnd.apple.mpegurl");

            if (canPlayNatively) {
              video.src = hlsUrl; // Safari
            } else {
              const Hls = (await import("hls.js")).default;
              if (Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(hlsUrl);
                hls.attachMedia(video);
              } else {
                // Very old browser: fall back to a single file.
                const s = await api.get(`/video-processing/stream-url/${videoId}`, { token });
                if (s?.streamUrl) video.src = s.streamUrl;
                else throw new Error("unsupported");
              }
            }
            if (!cancelled) {
              setAdaptive(true);
              setState("ready");
            }
            return;
          }

          const fallback =
            mp4Url || (await api.get(`/video-processing/stream-url/${videoId}`, { token }))?.streamUrl;
          if (fallback && !cancelled) {
            if (videoRef.current) videoRef.current.src = fallback;
            setState("ready");
            return;
          }
        }

        if (direct && !cancelled) {
          if (videoRef.current) videoRef.current.src = direct;
          setState("ready");
          return;
        }

        if (!cancelled) setState("none");
      } catch {
        if (!cancelled) setState("none");
      }
    })();

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      cleanupObjectUrl();
    };
  }, [lessonId, token]);

  return (
    <div className="w-full bg-black">
      <div className="container-x">
        <div className="relative mx-auto aspect-video w-full max-w-5xl">
          {/* The element stays mounted so hls.js can attach to it. */}
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            className={`h-full w-full ${state === "ready" ? "" : "hidden"}`}
          />

          {state !== "ready" && (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy to-brand-700 text-center text-white">
              {state === "loading" ? (
                <p className="text-white/80">Loading lesson…</p>
              ) : (
                <div className="px-6">
                  <svg className="mx-auto h-14 w-14 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="14" rx="2" />
                    <polygon points="10 8 16 11 10 14 10 8" fill="currentColor" />
                  </svg>
                  <p className="mt-4 text-lg font-semibold">Video coming soon</p>
                  <p className="mt-1 text-sm text-white/70">
                    {title ? `“${title}” — ` : ""}lesson materials are below. You can still mark it complete.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status badge */}
          {state === "ready" && (offline || adaptive) && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {offline ? "⬇ Playing offline — no data used" : "◆ Auto quality"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
