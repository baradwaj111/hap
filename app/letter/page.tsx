import Link from "next/link";

// REPLACE_ME: this is a placeholder letter. Write your own before deploying.
const LETTER_TEXT = `My love,

If you're reading this, it means you found your way here, and I just want you to know — I see you. Not the version of you that's holding everything together for everyone else, but the real one. The tired one. The soft one. The one who's still healing from things that were never her fault.

I didn't build this little app because you're broken. I built it because I wanted you to have somewhere gentle to land, especially on the nights that feel long. Somewhere that never asks you to perform, or prove, or earn your place.

You don't have to be okay for me to love you. You don't have to save anyone, including me, to deserve to be here. You are allowed to rest. You are allowed to be a work in progress. You are allowed to take up space in my life exactly as you are, today, right now.

I'm proud of you in ways I don't say enough. For getting through shifts that drain you. For still choosing softness after everything that tried to take it from you. For trusting me, even slowly, even carefully, even when trust hasn't earned you much before.

Wherever you are when you read this — I hope it's a little quieter in your mind than it was a moment ago.

I love you. All of you. Even the parts you're still learning to love yourself.

— B`;

export default function LetterPage() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 pb-10 pt-8 md:max-w-2xl md:px-8 md:pt-12"
      style={{
        background:
          "linear-gradient(180deg, var(--color-bg) 0%, var(--color-accent-3) 140%)",
      }}
    >
      <Link href="/settings" className="focus-ring text-sm text-muted underline underline-offset-2">
        ← back to settings
      </Link>

      <div
        className="relative flex-1 rounded-3xl p-7"
        style={{
          background: "var(--color-surface)",
          boxShadow: "0 12px 40px -12px rgb(74 68 88 / 0.25)",
        }}
      >
        <span className="absolute -top-3 left-6 text-2xl" aria-hidden>
          🌸
        </span>
        <span className="absolute -bottom-3 right-6 text-2xl" aria-hidden>
          🌷
        </span>
        <h1 className="font-display text-2xl">A letter for you</h1>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{LETTER_TEXT}</p>
      </div>
    </main>
  );
}
