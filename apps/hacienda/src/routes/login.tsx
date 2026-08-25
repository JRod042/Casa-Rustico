import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    return <Navigate to="/" />;
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      await authClient.getSession();
      void navigate({ to: "/" });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh bg-ink text-cream">
      <img
        src="/products/highlands.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/45 to-ink/88" />
      <div
        className="relative flex min-h-dvh flex-col px-6"
        style={{
          paddingTop: "max(48px, env(safe-area-inset-top))",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        <Link to="/" className="self-end text-[13px] text-cream/70">
          Not now
        </Link>
        <div className="mt-10 stagger-in">
          <p className="text-[12px] uppercase tracking-[0.2em] text-cream/70">
            Hacienda Rewards
          </p>
          <h1 className="mt-2 font-display text-[40px] leading-[1.05] tracking-tight">
            Casa Rústico
          </h1>
          <p className="mt-3 max-w-sm text-[16px] leading-snug text-cream/80">
            A short honest menu, beans on every cup, and a house mark you can wear.
          </p>
        </div>
        <div className="mt-auto space-y-3 pb-4">
          {authEnabled ? (
            <>
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full bg-cream text-ink"
                  onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
              <form onSubmit={(e) => void onEmail(e)} className="space-y-2 pt-2">
                {mode === "up" ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    autoComplete="name"
                    className="h-12 w-full rounded-md bg-cream/12 px-4 text-[16px] text-cream outline-none placeholder:text-cream/40 ring-1 ring-cream/15"
                  />
                ) : null}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="h-12 w-full rounded-md bg-cream/12 px-4 text-[16px] text-cream outline-none placeholder:text-cream/40 ring-1 ring-cream/15"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  className="h-12 w-full rounded-md bg-cream/12 px-4 text-[16px] text-cream outline-none placeholder:text-cream/40 ring-1 ring-cream/15"
                />
                {err ? <p className="text-[13px] text-cream/80">{err}</p> : null}
                <Button
                  type="submit"
                  variant="forest"
                  size="lg"
                  className="w-full"
                  disabled={busy}
                >
                  {busy
                    ? "Please wait…"
                    : mode === "up"
                      ? "Create account"
                      : "Sign in with email"}
                </Button>
              </form>
              <button
                type="button"
                className="w-full py-2 text-center text-[13px] text-cream/70"
                onClick={() => setMode(mode === "up" ? "in" : "up")}
              >
                {mode === "up" ? "Have an account? Sign in" : "New here? Create an account"}
              </button>
            </>
          ) : (
            <p className="text-sm text-cream/70">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
