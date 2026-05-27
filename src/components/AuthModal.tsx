import { useState } from "react";
import { api, setToken, setCachedUser } from "@/lib/api";
import type { User } from "@/lib/api";

interface Props {
  onSuccess: (user: User) => void;
}

export function AuthModal({ onSuccess }: Props) {
  const [tab, setTab]         = useState<"login" | "signup">("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    setError("");
    try {
      const res =
        tab === "login"
          ? await api.login(email.trim(), password)
          : await api.signup(email.trim(), password, name.trim());
      setToken(res.token);
      setCachedUser(res.user);
      onSuccess(res.user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent/60 placeholder:text-zinc-600 transition-colors";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-sm space-y-5">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="font-display text-5xl tracking-widest uppercase">
            Flip<span className="text-accent">Radar</span>
          </div>
          <p className="text-zinc-500 text-xs mt-1">Your personal marketplace scout</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
              tab === "login" ? "bg-accent text-black" : "text-zinc-500"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
              tab === "signup" ? "bg-accent text-black" : "text-zinc-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-3">
          {tab === "signup" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={field}
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-950/50 border border-red-500/30 rounded-xl text-sm text-red-400 leading-relaxed">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-4 bg-accent text-black font-display text-lg uppercase tracking-wide rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
        >
          {loading
            ? "Please wait…"
            : tab === "login"
            ? "Log In"
            : "Create Account"}
        </button>

        {loading && (
          <p className="text-center text-xs text-zinc-600">
            May take ~15s if server is waking up…
          </p>
        )}
      </div>
    </div>
  );
}
