"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AmbientBackdrop } from "@/components/ui/AmbientBackdrop";
import { NightSky } from "@/components/ui/NightSky";
import { Duck, type DuckState } from "@/components/mascot/Duck";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/config";
import { useIsNightMode, useSettings } from "@/lib/hooks";
import { usernameToEmail } from "@/lib/username";

const MIN_PASSWORD_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const settings = useSettings();
  const isNight = useIsNightMode(settings.dayStartHour);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);
  const [welcomed, setWelcomed] = useState(false);

  const duckState: DuckState = welcomed ? "hug" : error ? "sleepy" : "idle";

  function goToApp(userId: string, supabase: ReturnType<typeof createClient>) {
    setWelcomed(true);
    void (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setTimeout(() => {
        router.push(profile?.role === "admin" ? "/settings" : "/today");
        router.refresh();
      }, 550);
    })();
  }

  function switchMode(next: "login" | "reset") {
    setMode(next);
    setError(null);
    setNewPassword("");
    setConfirmPassword("");
  }

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
      setShake((n) => n + 1);
      setLoading(false);
      return;
    }

    goToApp(data.user.id, supabase);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password should be at least ${MIN_PASSWORD_LENGTH} characters.`);
      setShake((n) => n + 1);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      setShake((n) => n + 1);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Validate the existing password by actually signing in with it — this
    // both confirms it's correct and gives us the session updateUser needs.
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    if (signInError || !data.user) {
      setError("Your username or current password is incorrect.");
      setShake((n) => n + 1);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError("Couldn't update your password. Try again?");
      setShake((n) => n + 1);
      setLoading(false);
      return;
    }

    goToApp(data.user.id, supabase);
  }

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center"
      data-theme={isNight ? "night" : settings.palette}
      style={{ background: "var(--color-bg)" }}
    >
      <AmbientBackdrop />
      <NightSky />

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <Duck state={duckState} size={150} />
      </motion.div>

      <motion.form
        onSubmit={mode === "login" ? handleSubmit : handleReset}
        initial={reduce ? undefined : { opacity: 0, y: 22, scale: 0.96 }}
        animate={
          shake
            ? { opacity: 1, y: 0, scale: 1, x: [0, -10, 10, -6, 6, 0] }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          shake
            ? { x: { duration: 0.45, ease: "easeInOut" } }
            : { duration: 0.5, ease: "easeOut", delay: 0.08 }
        }
        key={shake}
        className="card relative z-10 flex w-full max-w-xs flex-col gap-3 p-7"
        style={{
          backdropFilter: "blur(6px)",
          background:
            "linear-gradient(165deg, color-mix(in srgb, var(--color-surface) 92%, var(--color-accent-1) 8%), var(--color-surface))",
        }}
      >
        <div className="flex flex-col gap-1">
          <p className="eyebrow">{APP_NAME}</p>
          <h1 className="font-display text-2xl">
            {welcomed ? "yay, you're in! 🎉" : mode === "reset" ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted">
            {welcomed
              ? "taking you there now..."
              : mode === "reset"
                ? "enter your current password and a new one"
                : "your gentle companion missed you 🐣"}
          </p>
        </div>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          autoCapitalize="off"
          autoComplete="username"
          disabled={loading || welcomed}
          className="focus-ring rounded-xl px-3.5 py-2.5 text-sm transition-shadow duration-200"
          style={{
            background: "var(--color-bg)",
            border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
          }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder={mode === "reset" ? "current password" : "password"}
          autoComplete="current-password"
          disabled={loading || welcomed}
          className="focus-ring rounded-xl px-3.5 py-2.5 text-sm transition-shadow duration-200"
          style={{
            background: "var(--color-bg)",
            border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
          }}
        />

        {mode === "reset" && (
          <>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="new password"
              autoComplete="new-password"
              disabled={loading || welcomed}
              className="focus-ring rounded-xl px-3.5 py-2.5 text-sm transition-shadow duration-200"
              style={{
                background: "var(--color-bg)",
                border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
              }}
            />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="confirm new password"
              autoComplete="new-password"
              disabled={loading || welcomed}
              className="focus-ring rounded-xl px-3.5 py-2.5 text-sm transition-shadow duration-200"
              style={{
                background: "var(--color-bg)",
                border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
              }}
            />
          </>
        )}

        {error && (
          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[var(--color-attention)]"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={
            loading ||
            welcomed ||
            !username ||
            !password ||
            (mode === "reset" && (!newPassword || !confirmPassword))
          }
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className="btn-squish focus-ring mt-1 rounded-2xl py-2.5 text-sm font-semibold disabled:opacity-50"
          style={{
            background: welcomed
              ? "var(--color-accent-4)"
              : "linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2))",
            boxShadow: "0 8px 20px -8px color-mix(in srgb, var(--color-accent-1) 60%, transparent)",
          }}
        >
          {welcomed
            ? "see you inside ✨"
            : loading
              ? mode === "reset"
                ? "updating..."
                : "logging in..."
              : mode === "reset"
                ? "Update password"
                : "Log in"}
        </motion.button>

        {!welcomed && (
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "reset" : "login")}
            disabled={loading}
            className="focus-ring text-xs text-muted underline decoration-dotted underline-offset-2"
          >
            {mode === "login" ? "forgot your password?" : "back to log in"}
          </button>
        )}

        <p className="text-xs text-muted opacity-70">everything stays on this phone 🔒</p>
      </motion.form>
    </main>
  );
}
