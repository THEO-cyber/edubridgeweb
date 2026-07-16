"use client";

import { useCallback, useEffect, useState } from "react";
import { api, pickList } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export default function LessonNotes({ lessonId, token }: { lessonId: string; token: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api.get(`/notes/lessons/${lessonId}`, { token });
      setNotes(pickList(d, ["notes", "items"]));
    } catch {
      setNotes([]);
    }
  }, [lessonId, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      await api.post(`/notes/lessons/${lessonId}`, { content: draft.trim() }, { token });
      setDraft("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function save(id: string) {
    if (!editText.trim()) return;
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, content: editText } : n)));
    setEditing(null);
    try { await api.patch(`/notes/${id}`, { content: editText.trim() }, { token }); } catch { load(); }
  }

  async function remove(id: string) {
    setNotes((p) => p.filter((n) => n.id !== id));
    try { await api.del(`/notes/${id}`, { token }); } catch { load(); }
  }

  return (
    <div>
      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note for this lesson…"
          rows={2}
          className="flex-1 resize-y rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <button onClick={add} disabled={busy || !draft.trim()} className="shrink-0 self-start rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-muted">No notes yet for this lesson. Jot down key takeaways as you learn.</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-line bg-white p-3">
              {editing === n.id ? (
                <>
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="w-full resize-y rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-500" />
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => save(n.id)} className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white">Save</button>
                    <button onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:bg-soft">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="whitespace-pre-line text-sm text-ink">{n.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <span>{timeAgo(n.createdAt)}</span>
                    <button onClick={() => { setEditing(n.id); setEditText(n.content); }} className="font-semibold text-brand-500 hover:underline">Edit</button>
                    <button onClick={() => remove(n.id)} className="font-semibold text-red-500 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
