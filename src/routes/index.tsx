import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Eye, Radio, ClipboardList, Banknote,
  Camera, Upload, Search, RefreshCw,
  Trash2, Star, Link as LinkIcon, Sparkles, ShieldCheck,
  TrendingUp, Plus, ChevronRight, X, Lightbulb,
  LogOut, AlertCircle, ArrowDown,
} from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import {
  api, getToken, clearToken, getCachedUser, setCachedUser,
  pushHistory, getHistory, clearHistory, calcTotalProfit,
  saveListing, unsaveListing, isListingSaved, getSaved,
} from "@/lib/api";
import type {
  Listing, Watch, AppraisalResult, CreateWatchPayload, User, HistoryEntry,
} from "@/lib/api";

export const Route = createFileRoute("/")({ component: Index });

type Tab = "scan" | "watch" | "feed" | "history" | "sell";

// ── Root ──────────────────────────────────────────────────
function Index() {
  const [tab, setTab]       = useState<Tab>("feed");
  const [user, setUser]     = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const cached = getCachedUser();
      setUser(cached ?? { id: "", email: "" });
    }
    setAuthReady(true);
    setProfit(calcTotalProfit());

    const handleUnauth = () => { clearToken(); setUser(null); };
    window.addEventListener("flipradar:unauthorized", handleUnauth);
    return () => window.removeEventListener("flipradar:unauthorized", handleUnauth);
  }, []);

  const handleLogin = useCallback((u: User) => {
    setCachedUser(u); setUser(u);
  }, []);

  const handleLogout = useCallback(() => {
    clearToken(); setUser(null);
  }, []);

  const refreshProfit = useCallback(() => setProfit(calcTotalProfit()), []);

  if (!authReady) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex justify-center">
      {!user && <AuthModal onSuccess={handleLogin} />}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative">
        <AppHeader user={user} profit={profit} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto pb-28">
          {tab === "scan"    && <ScanTab    onScanComplete={refreshProfit} />}
          {tab === "watch"   && <WatchTab   />}
          {tab === "feed"    && <FeedTab    />}
          {tab === "history" && <HistoryTab onProfitChange={refreshProfit} />}
          {tab === "sell"    && <SellTab    />}
        </main>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────
function AppHeader({ user, profit, onLogout }: { user: User | null; profit: number; onLogout: () => void }) {
  const initial = user ? (user.name ?? user.email ?? "?")[0].toUpperCase() : "?";
  const [showMenu, setShowMenu] = useState(false);
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-accent" />
        <span className="font-display text-xl tracking-tight uppercase">
          Flip<span className="text-accent">Radar</span>
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/25 px-2 py-1 rounded">
          <TrendingUp className="size-3 text-accent" strokeWidth={2.5} />
          <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
            {profit > 0 ? `+$${Math.round(profit).toLocaleString("en-AU")}` : "$0 profit"}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="size-8 rounded-full bg-surface border border-border grid place-items-center text-xs font-bold text-accent"
          >
            {initial}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl min-w-[180px] z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-zinc-800">
                <p className="text-xs font-bold text-white truncate">{user?.name ?? "Account"}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowMenu(false); onLogout(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="size-3.5" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Bottom Nav ────────────────────────────────────────────
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Zap }[] = [
    { id: "scan",    label: "Scan",    icon: Zap },
    { id: "watch",   label: "Watch",   icon: Eye },
    { id: "feed",    label: "Feed",    icon: Radio },
    { id: "history", label: "History", icon: ClipboardList },
    { id: "sell",    label: "Sell",    icon: Banknote },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto h-20 bg-background/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 pb-3 z-40">
      {items.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1 flex-1 py-1.5">
            <Icon className={`size-5 ${active ? "text-accent" : "text-zinc-500"}`} strokeWidth={active ? 2.5 : 2} />
            <span className={`text-[10px] font-bold uppercase tracking-tight ${active ? "text-accent" : "text-zinc-500"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Shared ────────────────────────────────────────────────
function TrustStrip() {
  return (
    <div className="flex items-stretch justify-between gap-2 py-3 px-1 border-y border-border/70">
      {[{ k: "Accuracy", v: "98.2%" }, { k: "Listings", v: "2.4M+" }, { k: "AI Model", v: "Gemini" }].map((s) => (
        <div key={s.k} className="flex-1 flex flex-col items-center gap-0.5">
          <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{s.k}</span>
          <span className="text-xs font-bold text-white">{s.v}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-sm uppercase tracking-[0.18em] text-zinc-500">{children}</h2>
      {action}
    </div>
  );
}

const VD: Record<string, { badge: string; label: string }> = {
  "STEAL":     { badge: "bg-accent text-black",      label: "🔥 STEAL" },
  "GOOD DEAL": { badge: "bg-emerald-400 text-black", label: "✅ GOOD DEAL" },
  "FAIR":      { badge: "bg-yellow-400 text-black",  label: "⚖️ FAIR" },
  "PASS":      { badge: "bg-red-500 text-white",      label: "🚫 PASS" },
};

// ── Appraisal Result Panel ────────────────────────────────
function AppraisalPanel({
  result, listing, onClose,
}: { result: AppraisalResult; listing?: Listing | null; onClose: () => void }) {
  const style  = VD[result.verdict] ?? VD["FAIR"];
  const profit = result.estimatedProfit ?? 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] max-h-[90dvh] overflow-y-auto bg-zinc-950 border-t border-zinc-800 rounded-t-2xl pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-3 mb-4" />

        {listing?.image && (
          <div className="w-full h-48 relative overflow-hidden mb-4">
            <img src={listing.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl brightness-50 scale-110" />
            <img src={listing.image} alt="" className="absolute inset-0 w-full h-full object-contain" />
          </div>
        )}
        {listing?.url && (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mx-4 mb-4 py-2.5 bg-accent/10 border border-accent/25 rounded-xl text-accent text-sm font-bold"
          >
            <LinkIcon className="size-3.5" /> View on Facebook Marketplace
          </a>
        )}

        <div className="px-4 space-y-4">
          {/* Verdict */}
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-800">
            <div className={`px-3 py-1.5 rounded-lg font-display text-lg tracking-wide ${style.badge}`}>
              {style.label}
            </div>
            <div className="flex-1">
              <div className="text-sm text-zinc-300 leading-snug">{result.oneLiner}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${result.dealScore ?? 0}%` }} />
                </div>
                <span className="font-mono text-sm font-bold text-accent">{result.dealScore}/100</span>
              </div>
            </div>
          </div>

          {/* Broken warning */}
          {result.isBrokenOrProject && (
            <div className="flex items-start gap-3 p-3 bg-yellow-950/40 border border-yellow-500/30 rounded-xl">
              <AlertCircle className="size-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300 leading-relaxed">
                <strong>Broken / project item</strong>
                {result.repairEstimate ? ` — est. repair $${result.repairEstimate.toLocaleString("en-AU")}` : ""}
                {result.repairNotes ? ` · ${result.repairNotes}` : ""}
              </p>
            </div>
          )}

          {/* Numbers */}
          <div className="grid grid-cols-2 gap-2">
            <NumCard label="Market Value" value={`$${(result.estimatedMarketValue ?? 0).toLocaleString("en-AU")}`} />
            <NumCard label="Est. Profit"  value={`${profit >= 0 ? "+" : ""}$${Math.abs(profit).toLocaleString("en-AU")}`} accent={profit > 0} />
            <NumCard label="ROI"          value={`${result.roiPercent ?? 0}%`} />
            <NumCard label="Offer"        value={`$${(result.recommendedOffer ?? 0).toLocaleString("en-AU")}`} />
            <NumCard label="Resell Low"   value={`$${(result.estimatedResellLow ?? 0).toLocaleString("en-AU")}`} />
            <NumCard label="Resell High"  value={`$${(result.estimatedResellHigh ?? 0).toLocaleString("en-AU")}`} />
            <NumCard label="Walk-Away"    value={`$${(result.walkAwayPrice ?? 0).toLocaleString("en-AU")}`} />
            <NumCard label="Time to Sell" value={result.timeToSell ?? "—"} />
          </div>

          {result.whyItsWorth && (
            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              {result.whyItsWorth}
            </p>
          )}

          {(result.greenFlags?.length ?? 0) > 0 && (
            <FlagList title="Green Flags"    color="text-accent"      items={result.greenFlags}          icon="✅" />
          )}
          {(result.redFlags?.length ?? 0) > 0 && (
            <FlagList title="Red Flags"      color="text-red-400"     items={result.redFlags}            icon="⚠️" />
          )}
          {(result.whatToCheckInPerson?.length ?? 0) > 0 && (
            <FlagList title="Check In Person" color="text-yellow-400" items={result.whatToCheckInPerson} icon="🔍" />
          )}

          {result.negotiationScript && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Negotiation Script</p>
              <p className="text-xs text-zinc-300 leading-relaxed italic">"{result.negotiationScript}"</p>
            </div>
          )}

          <button onClick={onClose} className="w-full py-3.5 border border-zinc-700 rounded-xl text-sm font-bold text-zinc-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function NumCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "bg-accent/5 border-accent/25" : "bg-zinc-900 border-zinc-800"}`}>
      <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <div className={`font-mono text-sm font-bold ${accent ? "text-accent" : "text-white"}`}>{value}</div>
    </div>
  );
}

function FlagList({ title, color, items, icon }: { title: string; color: string; items: string[]; icon: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{title}</p>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 text-xs text-zinc-300 leading-relaxed">
          <span className="shrink-0">{icon}</span><span>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ── SCAN TAB ──────────────────────────────────────────────
const SCAN_STEPS = [
  "Extracting listing details…",
  "Checking AU market data…",
  "Building flip analysis…",
  "Finalising verdict…",
];

const TEXT_PROMPT = (txt: string) =>
  `You are an expert Australian Facebook Marketplace flipper. Give a sharp appraisal based on Australian resale market pricing. For vehicles, mileage/odometer is critical. If the item is broken, "for parts", "not working", "as-is", or needs significant repair, set isBrokenOrProject true and estimate repairEstimate in AUD — subtract it from estimatedProfit and cap the verdict at FAIR unless margins after full repairs are exceptional.

LISTING:
"""
${txt}
"""

Return ONLY valid JSON:
{"extractedTitle":string,"extractedPrice":number,"extractedMileage":number|null,"verdict":"STEAL"|"GOOD DEAL"|"FAIR"|"PASS","dealScore":number,"roiPercent":number,"estimatedMarketValue":number,"estimatedResellLow":number,"estimatedResellHigh":number,"recommendedOffer":number,"walkAwayPrice":number,"estimatedProfit":number,"timeToSell":string,"demandLevel":string,"oneLiner":string,"whyItsWorth":string,"greenFlags":["string"],"redFlags":["string"],"whatToCheckInPerson":["string"],"negotiationScript":string,"isBrokenOrProject":false,"repairEstimate":0}`;

function ScanTab({ onScanComplete }: { onScanComplete: () => void }) {
  const [text, setText]       = useState("");
  const [tipOpen, setTipOpen] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<AppraisalResult | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [viewEntry, setViewEntry] = useState<HistoryEntry | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const history = getHistory().slice(0, 3);

  const scan = async () => {
    if (!text.trim()) { setError("Paste a listing first."); return; }
    setScanning(true); setError(""); setResult(null); setStepIdx(0);
    timer.current = setInterval(() => setStepIdx((i) => Math.min(i + 1, SCAN_STEPS.length - 1)), 900);
    try {
      const r = await api.appraiseText({ prompt: TEXT_PROMPT(text) });
      if (timer.current) clearInterval(timer.current);
      setResult(r);
      pushHistory({
        id: Date.now(),
        title: r.extractedTitle ?? text.slice(0, 60),
        price: r.extractedPrice ?? 0,
        image: null, url: null,
        date: new Date().toLocaleDateString("en-AU"),
        result: r,
      });
      onScanComplete();
    } catch (e: unknown) {
      if (timer.current) clearInterval(timer.current);
      setError(e instanceof Error ? e.message : "Scan failed. Try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="px-4 py-5 space-y-6">
      {tipOpen && (
        <div className="flex items-start gap-3 p-3 bg-surface border border-accent/20 rounded-xl">
          <Lightbulb className="size-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold mb-0.5">How FlipRadar works</p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Paste the full listing text — AI gives you an instant AU market appraisal with flip verdict, profit estimate, and negotiation script.
            </p>
          </div>
          <button onClick={() => setTipOpen(false)} className="text-zinc-500"><X className="size-3.5" /></button>
        </div>
      )}

      <div className="space-y-1.5">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Appraise Listing</h1>
        <p className="text-zinc-500 text-xs">AI-powered AU market valuation.</p>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          disabled={scanning}
          className="w-full h-44 bg-surface border border-border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-accent/50 placeholder:text-zinc-700 resize-none disabled:opacity-50 transition-colors"
          placeholder={`Paste the full listing here…\n\ne.g. 2016 KTM RC390 — $3,500\n31,000 kms. Great learner bike, runs well. Northern suburbs Melbourne.`}
        />
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-600 uppercase">{text.length} chars</div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-500/30 rounded-xl text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />{error}
        </div>
      )}

      {scanning ? (
        <div className="space-y-4 py-2">
          <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            {SCAN_STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-2.5 text-xs transition-colors ${i < stepIdx ? "text-accent" : i === stepIdx ? "text-white" : "text-zinc-700"}`}>
                <div className={`size-1.5 rounded-full shrink-0 ${i < stepIdx ? "bg-accent" : i === stepIdx ? "bg-white animate-pulse" : "bg-zinc-700"}`} />
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={scan}
          disabled={!text.trim()}
          className="relative w-full bg-accent text-black font-display text-lg py-4 rounded-xl uppercase tracking-wide transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <Zap className="size-5" strokeWidth={2.5} fill="currentColor" />
            Scan This Deal
          </span>
        </button>
      )}

      <TrustStrip />

      {history.length > 0 && (
        <section>
          <SectionTitle>Recent Appraisals</SectionTitle>
          <div className="space-y-2.5">
            {history.map((entry) => {
              const vs = VD[entry.result?.verdict] ?? VD["FAIR"];
              return (
                <button
                  key={entry.id}
                  onClick={() => setViewEntry(entry)}
                  className="w-full bg-surface border border-border rounded-xl p-3 flex items-center gap-3 text-left hover:border-zinc-600 transition-colors"
                >
                  <div className={`px-2 py-1 rounded text-[9px] font-extrabold font-mono uppercase tracking-tighter shrink-0 ${vs.badge}`}>
                    {entry.result?.verdict ?? "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{entry.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">
                      ${entry.price.toLocaleString("en-AU")} · {entry.date}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-zinc-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {result     && <AppraisalPanel result={result}           listing={null}                      onClose={() => setResult(null)} />}
      {viewEntry  && <AppraisalPanel result={viewEntry.result} listing={null}                      onClose={() => setViewEntry(null)} />}
    </div>
  );
}

// ── WATCH TAB ─────────────────────────────────────────────
function WatchTab() {
  const qc = useQueryClient();
  const { data: watches = [], isLoading, error } = useQuery({
    queryKey: ["watches"],
    queryFn: api.getWatches,
    staleTime: 60_000,
  });
  const { data: planInfo } = useQuery({
    queryKey: ["plan"],
    queryFn: api.plan,
    staleTime: 5 * 60_000,
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteWatch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watches"] }),
  });
  const createMut = useMutation({
    mutationFn: (p: CreateWatchPayload) => api.createWatch(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["watches"] }); setShowForm(false); setKeyword(""); setMaxPrice(""); setMinPrice(""); setLocation(""); },
  });

  const [showForm, setShowForm] = useState(false);
  const [keyword,  setKeyword]  = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [location, setLocation] = useState("");

  const input = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/50 placeholder:text-zinc-600";

  const planLabel: Record<string, string> = { free: "Free", basic: "Basic", premium: "Premium ⭐" };

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Watch</h1>
        <p className="text-zinc-500 text-xs leading-relaxed">
          Auto-scans Marketplace every 15–30 mins and posts new listings to your Feed.
        </p>
      </div>

      {planInfo && (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Your Plan</div>
            <div className="font-display text-2xl uppercase tracking-tight">{planLabel[planInfo.plan] ?? planInfo.plan}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{watches.length} / {planInfo.watchlistLimit} watchlists used</div>
          </div>
          <div className="size-12 rounded-full bg-accent/10 border border-accent/30 grid place-items-center">
            <Star className="size-5 text-accent" fill="currentColor" />
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm((v) => !v)}
        className="w-full py-3.5 border border-accent/40 bg-accent/5 text-accent font-bold text-[11px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-accent/10 transition"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {showForm ? "Cancel" : "New Watchlist"}
      </button>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">New Watch</p>
          <input type="text" placeholder="Keyword (e.g. holden commodore)" value={keyword}
            onChange={(e) => setKeyword(e.target.value)} className={input} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={input} />
            <input type="number" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={input} />
          </div>
          <input type="text" placeholder="Location (e.g. melbourne)" value={location}
            onChange={(e) => setLocation(e.target.value)} className={input} />
          {createMut.error && <p className="text-xs text-red-400">{(createMut.error as Error).message}</p>}
          <button
            onClick={() => keyword.trim() && createMut.mutate({ keyword: keyword.trim(), minPrice: minPrice ? Number(minPrice) : null, maxPrice: maxPrice ? Number(maxPrice) : null, location: location.trim() || null })}
            disabled={!keyword.trim() || createMut.isPending}
            className="w-full py-3 bg-accent text-black font-bold text-sm rounded-lg disabled:opacity-50 transition-transform active:scale-[0.98]"
          >
            {createMut.isPending ? "Saving…" : "Add Watch"}
          </button>
        </div>
      )}

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMsg msg={(error as Error).message} />}

      <div className="space-y-2.5">
        {(watches as Watch[]).map((w) => {
          const freq = w.plan === "premium" ? "15 min" : w.plan === "basic" ? "30 min" : "60 min";
          const priceRange = [
            w.minPrice ? `$${w.minPrice.toLocaleString("en-AU")}` : null,
            w.maxPrice ? `Max $${w.maxPrice.toLocaleString("en-AU")}` : "Any price",
          ].filter(Boolean).join(" – ");
          return (
            <div key={w.id} className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-accent/10 border border-accent/20 grid place-items-center shrink-0">
                <Search className="size-4 text-accent" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{w.keyword}</div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight">
                  {priceRange} · every {freq} · {w.lastScanned ? relativeTime(w.lastScanned) : "never scanned"}
                </div>
              </div>
              <button
                onClick={() => deleteMut.mutate(w.id)}
                disabled={deleteMut.isPending && deleteMut.variables === w.id}
                className="px-3 py-1.5 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-500/10 disabled:opacity-40 transition"
              >
                {deleteMut.isPending && deleteMut.variables === w.id ? "…" : "Remove"}
              </button>
            </div>
          );
        })}
        {!isLoading && (watches as Watch[]).length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <Search className="size-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No watchlists yet</p>
            <p className="text-xs mt-1">Add one above to start scanning</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FEED TAB ──────────────────────────────────────────────
function FeedTab() {
  const { data: listings = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["listings"],
    queryFn: api.getListings,
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  const keywords = [...new Set((listings as Listing[]).map((l) => l.keyword).filter(Boolean))];
  const [active, setActive]           = useState<string | null>(null);
  const [appraising, setAppraising]   = useState<string | null>(null);
  const [panel, setPanel]             = useState<{ result: AppraisalResult; listing: Listing } | null>(null);
  const [savedState, setSavedState]   = useState<Record<string, boolean>>({});

  useEffect(() => {
    const m: Record<string, boolean> = {};
    (listings as Listing[]).forEach((l) => { m[l.id] = isListingSaved(l.id); });
    setSavedState(m);
  }, [listings]);

  const filtered = active
    ? (listings as Listing[]).filter((l) => l.keyword === active)
    : (listings as Listing[]);

  const toggleSave = (l: Listing) => {
    if (savedState[l.id]) { unsaveListing(l.id); setSavedState((s) => ({ ...s, [l.id]: false })); }
    else                  { saveListing(l);       setSavedState((s) => ({ ...s, [l.id]: true  })); }
  };

  const appraise = async (l: Listing) => {
    setAppraising(l.id);
    try {
      const result = l.make && l.year
        ? await api.appraiseVehicle({
            make: l.make, model: l.model ?? "", year: l.year,
            mileage: l.mileage, transmission: l.transmission,
            listingPrice: l.price, title: l.title,
            description: l.description ?? "", imageUrl: l.image ?? null,
          })
        : await api.appraiseText({ prompt: TEXT_PROMPT(buildListingText(l)), imageUrl: l.image ?? null });

      pushHistory({ id: Date.now(), title: l.title, price: l.price, image: l.image, url: l.url, date: new Date().toLocaleDateString("en-AU"), result });
      setPanel({ result, listing: l });
    } catch (e) {
      console.error("[Feed/appraise]", e);
    } finally {
      setAppraising(null);
    }
  };

  return (
    <div className="py-5 space-y-4">
      <div className="px-4 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Feed</h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" />
            {isFetching ? "Refreshing…" : "Live"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} disabled={isFetching} aria-label="Refresh"
            className="size-9 grid place-items-center rounded-lg bg-surface border border-border text-zinc-300 disabled:opacity-50">
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { Object.keys(getSaved()).forEach(unsaveListing); setSavedState({}); }} aria-label="Clear saved"
            className="size-9 grid place-items-center rounded-lg bg-surface border border-zinc-700 text-zinc-400">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          <Chip active={!active} onClick={() => setActive(null)}>All</Chip>
          {keywords.map((kw) => (
            <Chip key={kw} active={active === kw} onClick={() => setActive(kw === active ? null : kw)}>{kw}</Chip>
          ))}
        </div>
      )}

      <div className="px-4">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMsg msg={(error as Error).message} />}
        {!isLoading && filtered.length === 0 && !error && (
          <div className="text-center py-16 text-zinc-600">
            <Radio className="size-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No listings yet</p>
            <p className="text-xs mt-1">Add keywords in the Watch tab — listings appear here automatically</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((l: Listing) => (
            <FeedCard
              key={l.id}
              listing={l}
              isSaved={!!savedState[l.id]}
              isAppraising={appraising === l.id}
              onSave={() => toggleSave(l)}
              onAppraise={() => appraise(l)}
            />
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 pt-2">
          <div className="mx-auto w-fit bg-surface border border-border rounded-full px-4 py-2 flex items-center gap-2">
            <Sparkles className="size-3.5 text-accent" />
            <span className="text-[11px] font-bold text-accent">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {panel && <AppraisalPanel result={panel.result} listing={panel.listing} onClose={() => setPanel(null)} />}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${active ? "bg-accent text-black" : "bg-surface border border-border text-zinc-400"}`}
    >
      {children}
    </button>
  );
}

function buildListingText(l: Listing): string {
  let t = l.title + "\n";
  if (l.year)         t += `Year: ${l.year}\n`;
  if (l.make)         t += `Make: ${l.make}\n`;
  if (l.model)        t += `Model: ${l.model}\n`;
  if (l.transmission) t += `Transmission: ${l.transmission}\n`;
  if (!l.isOfferPrice && l.price) t += `Price: $${l.price}\n`;
  if (l.mileage)      t += `Odometer: ${l.mileage.toLocaleString()} km\n`;
  if (l.location)     t += `Location: ${l.location}\n`;
  if (l.description)  t += `Description: ${l.description}\n`;
  if (l.url)          t += `URL: ${l.url}`;
  return t;
}

function FeedCard({ listing, isSaved, isAppraising, onSave, onAppraise }: {
  listing: Listing; isSaved: boolean; isAppraising: boolean;
  onSave: () => void; onAppraise: () => void;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-zinc-900">
        {listing.image
          ? <img src={listing.image} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Camera className="size-8" /></div>
        }
        {listing.priceDropped && listing.dropAmount && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-red-500/90 px-1.5 py-0.5 rounded">
            <ArrowDown className="size-2.5 text-white" strokeWidth={3} />
            <span className="font-mono text-[9px] font-extrabold text-white uppercase">-${listing.dropAmount.toLocaleString("en-AU")}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded">
          <span className="font-mono text-[9px] font-bold text-white uppercase">NEW</span>
        </div>
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-[12px] font-bold leading-tight line-clamp-2">{listing.title}</h3>
        <div className="font-mono text-base font-extrabold text-accent leading-none">
          {listing.isOfferPrice ? "Make offer" : `$${listing.price.toLocaleString("en-AU")}`}
        </div>
        {(listing.year || listing.mileage) && (
          <div className="text-[9px] text-zinc-500 font-mono uppercase">
            {[listing.year, listing.mileage ? `${listing.mileage.toLocaleString()}km` : null].filter(Boolean).join(" · ")}
          </div>
        )}
        {listing.location && <div className="text-[9px] text-zinc-600 font-mono uppercase">{listing.location}</div>}
        <div className="flex items-center gap-1 mt-1.5">
          <button onClick={onSave} className={`size-7 rounded grid place-items-center bg-zinc-900 border ${isSaved ? "border-accent/40" : "border-border"}`}>
            <Star className={`size-3 ${isSaved ? "text-accent" : "text-zinc-400"}`} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <a href={listing.url} target="_blank" rel="noopener noreferrer" className="size-7 rounded grid place-items-center bg-zinc-900 border border-border">
            <LinkIcon className="size-3 text-zinc-400" />
          </a>
          <button
            onClick={onAppraise}
            disabled={isAppraising}
            className="flex-1 h-7 rounded bg-accent/10 border border-accent/30 text-accent font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center"
          >
            {isAppraising
              ? <span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
              : "Appraise"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY TAB ───────────────────────────────────────────
function HistoryTab({ onProfitChange }: { onProfitChange: () => void }) {
  const [hist, setHist] = useState<HistoryEntry[]>(getHistory);
  const [view, setView] = useState<HistoryEntry | null>(null);

  const saved        = getSaved();
  const totalScanned = hist.length;
  const steals       = hist.filter((e) => e.result?.verdict === "STEAL").length;
  const totalSaved   = Object.keys(saved).length;
  const totalProfit  = calcTotalProfit();

  const clearAll = () => {
    if (!confirm("Clear all history?")) return;
    clearHistory(); setHist([]); onProfitChange();
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Your Flips</h1>
        {hist.length > 0 && (
          <button onClick={clearAll} className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold hover:text-red-400 transition-colors">
            Clear
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="grid grid-cols-3 divide-x divide-border">
          <BigStat label="Scanned" value={String(totalScanned)} />
          <BigStat label="Steals 🔥" value={String(steals)} color="text-accent" />
          <BigStat label="Saved ★" value={String(totalSaved)} color="text-yellow-400" />
        </div>
      </div>

      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5">
        <TrendingUp className="size-4 text-accent" />
        <span className="text-xs text-zinc-400">Est. total profit:</span>
        <span className="font-mono text-sm font-bold text-accent">
          {totalProfit > 0 ? `+$${Math.round(totalProfit).toLocaleString("en-AU")}` : "$0"}
        </span>
      </div>

      {hist.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <ClipboardList className="size-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No appraisals yet</p>
          <p className="text-xs mt-1">Scan a listing to get started</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {hist.map((entry) => {
            const vs = VD[entry.result?.verdict] ?? VD["FAIR"];
            return (
              <button
                key={entry.id}
                onClick={() => setView(entry)}
                className="w-full bg-surface border border-border rounded-2xl p-3 flex items-center gap-3 text-left hover:border-zinc-600 transition-colors"
              >
                {entry.image
                  ? <img src={entry.image} alt="" loading="lazy" className="size-14 rounded-lg object-cover bg-zinc-900 shrink-0" />
                  : <div className="size-14 rounded-lg bg-zinc-900 border border-zinc-800 grid place-items-center shrink-0"><Zap className="size-5 text-zinc-700" /></div>
                }
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{entry.title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                    ${entry.price.toLocaleString("en-AU")} · {entry.date}
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase tracking-widest shrink-0 ${vs.badge}`}>
                  {entry.result?.verdict ?? "—"}
                </div>
                <ChevronRight className="size-4 text-zinc-600 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {view && (
        <AppraisalPanel
          result={view.result}
          listing={view.url ? { url: view.url, image: view.image } as unknown as Listing : null}
          onClose={() => setView(null)}
        />
      )}
    </div>
  );
}

function BigStat({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className={`font-display text-3xl leading-none ${color}`}>{value}</span>
    </div>
  );
}

// ── SELL TAB ──────────────────────────────────────────────
function SellTab() {
  const [desc, setDesc] = useState("");
  return (
    <div className="px-4 py-5 space-y-5">
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Sell Scanner</h1>
        <p className="text-zinc-500 text-xs leading-relaxed">
          Describe what you own — get sell prices, timeframes, and listing tips.
        </p>
      </div>
      <button className="w-full bg-surface border-2 border-dashed border-zinc-700 rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-accent/50 transition-colors">
        <div className="size-14 rounded-2xl bg-accent/10 border border-accent/30 grid place-items-center">
          <Upload className="size-6 text-accent" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <div className="text-base font-bold">Upload a photo</div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono uppercase tracking-tight">Tap to choose · JPG · PNG · HEIC</div>
        </div>
      </button>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">or describe it</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full h-32 bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent/50 placeholder:text-zinc-600 resize-none"
        placeholder="e.g. 2019 Kymco Agility 50cc, 8000km, good condition, serviced, includes helmet…"
      />
      <TrustStrip />
      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider">Backed by real sale data</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          We compare against 2.4M+ recent AU marketplace transactions. No vibes, just numbers.
        </p>
      </div>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-7 h-7 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-500/30 rounded-xl text-sm text-red-400 my-2">
      <AlertCircle className="size-4 shrink-0" />{msg}
    </div>
  );
}

function relativeTime(iso: string): string {
  try {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return "—"; }
}
