"use client";

import { useState } from "react";

export default function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  // A password field people can read back is the difference between a typo they
  // can see and a login they cannot explain.
  const inputType = isPassword && reveal ? "text" : type;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          required
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-line py-3 pl-4 outline-none focus:border-brand-500 ${
            isPassword ? "pr-12" : "pr-4"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            title={reveal ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 grid h-9 w-10 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink"
          >
            {reveal ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    </label>
  );
}

const Eye = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.6 6.1A9.5 9.5 0 0 1 12 6c6.4 0 10 7 10 7a17 17 0 0 1-2.4 3.3M6.6 6.6A17 17 0 0 0 2 13s3.6 7 10 7a9.3 9.3 0 0 0 4.5-1.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </svg>
);
