"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

// LiveKit must never run during SSR.
const LiveRoom = dynamic(() => import("@/components/LiveRoom"), { ssr: false });

type JoinData = { serverUrl: string; token: string; title: string };

export default function LiveRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ready" | "error" | "unconfigured">("loading");
  const [join, setJoin] = useState<JoinData | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace(`/login?next=/live/${id}/room`);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.post(`/live-sessions/${id}/join`, {}, { token });
        const serverUrl = res?.livekitUrl;
        const accessToken = res?.accessToken;
        if (cancelled) return;
        // LiveKit not set up on the server yet (no ws URL / placeholder token).
        if (!serverUrl || !accessToken || accessToken === "placeholder-token") {
          setState("unconfigured");
          return;
        }
        setJoin({ serverUrl, token: accessToken, title: res?.session?.title || "Live class" });
        setState("ready");
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || "Could not join this session.");
        setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, token, id, router]);

  const leave = useCallback(() => router.push("/live"), [router]);

  if (state === "loading") {
    return <Centered>Connecting you to the class…</Centered>;
  }

  if (state === "error") {
    return (
      <Centered>
        <p className="text-lg font-semibold">{err}</p>
        <p className="mt-1 text-sm text-muted">
          You can join up to 15 minutes before the start time, and only if your application was accepted.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/live" className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold hover:bg-soft">Back to live classes</Link>
          <button onClick={() => location.reload()} className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Retry</button>
        </div>
      </Centered>
    );
  }

  if (state === "unconfigured") {
    return (
      <Centered>
        <div className="text-4xl">🎥</div>
        <p className="mt-3 text-lg font-semibold">Live video isn&apos;t enabled yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Your spot is confirmed, but real-time video hasn&apos;t been switched on for this platform yet.
          Once the LiveKit keys are configured on the server, this class will open here automatically.
        </p>
        <Link href="/live" className="mt-5 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Back to live classes</Link>
      </Centered>
    );
  }

  return join ? <LiveRoom serverUrl={join.serverUrl} token={join.token} onLeave={leave} /> : null;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="container-x grid min-h-[calc(100vh-4rem)] place-items-center text-center"><div>{children}</div></div>;
}
