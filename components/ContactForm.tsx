"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

const TOPICS = ["General enquiry", "Course access / technical", "Payments & refunds", "Instructor / teaching", "Partnerships"];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `[${topic}] — ${name || "EduBridge enquiry"}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ada Lovelace"
            className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Your email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
            className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Topic</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand-500">
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="How can we help?"
          className="w-full resize-y rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500" />
      </label>
      <button className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700">
        Send message
      </button>
      <p className="text-center text-xs text-muted">
        This opens your email app addressed to {SITE.email}. Prefer to write directly? Email us any time.
      </p>
    </form>
  );
}
