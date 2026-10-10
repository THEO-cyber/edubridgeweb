"use client";

import { useState } from "react";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import Whiteboard from "./Whiteboard";

export default function LiveRoom({
  serverUrl,
  token,
  isInstructor,
  onLeave,
}: {
  serverUrl: string;
  token: string;
  isInstructor: boolean;
  onLeave: () => void;
}) {
  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-black" data-lk-theme="default">
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        video
        audio
        onDisconnected={onLeave}
        style={{ height: "100%" }}
      >
        <RoomContent isInstructor={isInstructor} onLeave={onLeave} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

function RoomContent({ isInstructor, onLeave }: { isInstructor: boolean; onLeave: () => void }) {
  const [boardOpen, setBoardOpen] = useState(false);
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const [busy, setBusy] = useState<"mic" | "cam" | null>(null);
  const [actionErr, setActionErr] = useState("");

  async function toggleMic() {
    setBusy("mic");
    setActionErr("");
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (e: any) {
      setActionErr(e?.message || "Couldn't reach your microphone.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleCam() {
    setBusy("cam");
    setActionErr("");
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (e: any) {
      setActionErr(e?.message || "Couldn't reach your camera.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {boardOpen ? (
          <Whiteboard visible={boardOpen} isInstructor={isInstructor} />
        ) : (
          <GridLayout tracks={tracks} style={{ height: "100%" }}>
            <ParticipantTile />
          </GridLayout>
        )}
      </div>

      {/* Keep the whiteboard mounted (hidden) while on the video view, so its
          data-channel listener and stroke history survive the toggle. */}
      {!boardOpen && <div className="hidden"><Whiteboard visible={false} isInstructor={isInstructor} /></div>}

      {actionErr && (
        <p className="bg-red-600/90 px-4 py-1.5 text-center text-sm text-white">{actionErr}</p>
      )}

      <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-black/70 px-4 py-3">
        <ControlButton
          active={isMicrophoneEnabled}
          busy={busy === "mic"}
          onClick={toggleMic}
          onLabel="Mute"
          offLabel="Unmute"
        />
        <ControlButton
          active={isCameraEnabled}
          busy={busy === "cam"}
          onClick={toggleCam}
          onLabel="Stop video"
          offLabel="Start video"
        />
        <button
          onClick={() => setBoardOpen((v) => !v)}
          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            boardOpen ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {boardOpen ? "Show video" : "Whiteboard"}
        </button>
        <button
          onClick={onLeave}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
        >
          Leave
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  busy,
  onClick,
  onLabel,
  offLabel,
}: {
  active: boolean;
  busy: boolean;
  onClick: () => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
        active ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {busy ? "…" : active ? onLabel : offLabel}
    </button>
  );
}
