"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { useAuth } from "@/lib/auth";

// Same Web OAuth client ID the mobile app passes as its Google Sign-In
// `serverClientId` — the backend verifies the ID token's `aud` against this,
// so web and mobile must use the same value.
const GOOGLE_CLIENT_ID = "628312261906-e46lcmni7u0g5ed8l6befkao67oengkc.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleButton({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        await loginWithGoogle(response.credential);
        onSuccess();
      } catch (e: any) {
        onError(e.message || "Google sign-in failed.");
      }
    },
    [loginWithGoogle, onSuccess, onError]
  );

  useEffect(() => {
    if (!scriptReady || !window.google || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });

    const render = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: containerRef.current.clientWidth || 320,
      });
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [scriptReady, handleCredential]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="flex w-full justify-center" />
    </>
  );
}
