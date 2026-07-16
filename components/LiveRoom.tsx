"use client";

import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

// A full video-conference room (camera, mic, screen-share, participant grid),
// matching the mobile app's live-class experience.
export default function LiveRoom({
  serverUrl,
  token,
  onLeave,
}: {
  serverUrl: string;
  token: string;
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
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
