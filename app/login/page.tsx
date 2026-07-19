"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Duck } from "@/components/mascot/Duck";
import { createClient } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/username";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    if (signInError || !data.user) {
      setError("That username or password doesn't match. Try again?");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.role === "admin" ? "/settings" : "/today");
    router.refresh();
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
      data-theme="lavender"
      style={{ background: "var(--color-bg)" }}
    >
      <Duck state="idle" />
      <form onSubmit={handleSubmit} className="card flex w-full max-w-xs flex-col gap-3 p-6">
        <h1 className="font-display text-xl">Welcome back</h1>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          autoCapitalize="off"
          autoComplete="username"
          className="focus-ring rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--color-bg)" }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          autoComplete="current-password"
          className="focus-ring rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--color-bg)" }}
        />

        {error && <p className="text-sm text-[var(--color-attention)]">{error}</p>}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="btn-squish focus-ring mt-1 rounded-2xl py-2.5 text-sm disabled:opacity-50"
          style={{ background: "var(--color-accent-1)" }}
        >
          {loading ? "logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
