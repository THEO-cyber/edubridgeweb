"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, type RemoteParticipant } from "livekit-client";

// Logical drawing surface — every viewer sends/receives points normalized to
// this, so differing screen sizes never cause strokes to land in the wrong place.
const W = 1280;
const H = 720;

type Segment = { x0: number; y0: number; x1: number; y1: number; color: string; width: number };
type WireMsg =
  | { type: "draw"; s: Segment }
  | { type: "clear" }
  | { type: "request-state" }
  | { type: "state"; segments: Segment[] };

const COLORS = ["#111827", "#DC2626", "#2563EB", "#16A34A", "#F59E0B"];

export default function Whiteboard({
  visible,
  isInstructor,
}: {
  visible: boolean;
  isInstructor: boolean;
}) {
  const room = useRoomContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);

  const ctx = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const drawSegment = useCallback(
    (s: Segment) => {
      const c = ctx();
      if (!c) return;
      c.strokeStyle = s.color;
      c.lineWidth = s.width;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(s.x0 * W, s.y0 * H);
      c.lineTo(s.x1 * W, s.y1 * H);
      c.stroke();
    },
    [ctx]
  );

  const clearCanvas = useCallback(() => {
    const c = ctx();
    if (!c) return;
    c.clearRect(0, 0, W, H);
  }, [ctx]);

  const send = useCallback(
    (msg: WireMsg, reliable = true) => {
      room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(msg)),
        { reliable, topic: "whiteboard" }
      );
    },
    [room]
  );

  // Redraw everything after a resize (canvas is logical-resolution, so this is
  // only needed once on mount) and wire up the data channel.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = W;
      canvas.height = H;
    }

    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string
    ) => {
      if (topic !== "whiteboard") return;
      let msg: WireMsg;
      try {
        msg = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }
      if (msg.type === "draw") {
        segmentsRef.current.push(msg.s);
        drawSegment(msg.s);
      } else if (msg.type === "clear") {
        segmentsRef.current = [];
        clearCanvas();
      } else if (msg.type === "request-state" && isInstructor) {
        send({ type: "state", segments: segmentsRef.current }, true);
      } else if (msg.type === "state" && !isInstructor) {
        segmentsRef.current = msg.segments;
        clearCanvas();
        msg.segments.forEach(drawSegment);
      }
    };

    room.on(RoomEvent.DataReceived, onData);

    // New joiner: ask whoever already has the board for its current state.
    if (!isInstructor) send({ type: "request-state" }, true);

    // Someone just joined: if we're the instructor, bring them up to speed.
    const onJoin = () => {
      if (isInstructor) send({ type: "state", segments: segmentsRef.current }, true);
    };
    room.on(RoomEvent.ParticipantConnected, onJoin);

    return () => {
      room.off(RoomEvent.DataReceived, onData);
      room.off(RoomEvent.ParticipantConnected, onJoin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function posFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isInstructor) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = posFromEvent(e);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isInstructor || !drawingRef.current || !lastPointRef.current) return;
    const p = posFromEvent(e);
    const s: Segment = { x0: lastPointRef.current.x, y0: lastPointRef.current.y, x1: p.x, y1: p.y, color, width: lineWidth };
    lastPointRef.current = p;
    segmentsRef.current.push(s);
    drawSegment(s);
    send({ type: "draw", s }, false);
  }

  function onPointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function clearBoard() {
    segmentsRef.current = [];
    clearCanvas();
    send({ type: "clear" }, true);
  }

  return (
    <div className={visible ? "flex h-full flex-col" : "hidden"}>
      {isInstructor && (
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-3 py-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Pen color ${c}`}
              className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="mx-2 h-5 w-px bg-white/20" />
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              onClick={() => setLineWidth(w)}
              aria-label={`Pen width ${w}`}
              className={`grid h-7 w-7 place-items-center rounded-md ${lineWidth === w ? "bg-white/20" : ""}`}
            >
              <span className="rounded-full bg-white" style={{ width: w + 2, height: w + 2 }} />
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={clearBoard} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10">
            Clear board
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className={`h-full w-full ${isInstructor ? "cursor-crosshair touch-none" : ""}`}
        />
      </div>
    </div>
  );
}
