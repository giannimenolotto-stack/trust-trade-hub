import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap, Eye, Radio, ClipboardList, Banknote,
  Camera, Upload, Search, RefreshCw, Ban, Trash2,
  Star, Link as LinkIcon, Sparkles, ShieldCheck, TrendingUp,
  Plus, ChevronRight, X, Lightbulb,
} from "lucide-react";
import ktmImg from "@/assets/ktm-rc390.jpg";
import bmwImg from "@/assets/bmw-x1.jpg";
import camryImg from "@/assets/toyota-camry.jpg";
import lexusImg from "@/assets/lexus-hs.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

type Tab = "scan" | "watch" | "feed" | "history" | "sell";

function Index() {
  const [tab, setTab] = useState<Tab>("scan");
  return (
    <div className="min-h-screen bg-background text-foreground font-body flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative">
        <AppHeader />
        <main className="flex-1 overflow-y-auto pb-28">
          {tab === "scan" && <ScanTab />}
          {tab === "watch" && <WatchTab />}
          {tab === "feed" && <FeedTab />}
          {tab === "history" && <HistoryTab />}
          {tab === "sell" && <SellTab />}
        </main>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

/* ---------------- HEADER ---------------- */
function AppHeader() {
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
            +$1,240
          </span>
        </div>
        <div className="size-8 rounded-full bg-surface border border-border grid place-items-center text-xs font-bold text-accent">
          G
        </div>
      </div>
    </header>
  );
}

/* ---------------- BOTTOM NAV ---------------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Zap }[] = [
    { id: "scan", label: "Scan", icon: Zap },
    { id: "watch", label: "Watch", icon: Eye },
    { id: "feed", label: "Feed", icon: Radio },
    { id: "history", label: "History", icon: ClipboardList },
    { id: "sell", label: "Sell", icon: Banknote },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto h-20 bg-background/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 pb-3 z-40">
      {items.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex flex-col items-center gap-1 flex-1 py-1.5 transition-opacity"
          >
            <Icon
              className={`size-5 ${active ? "text-accent" : "text-zinc-500"}`}
              strokeWidth={active ? 2.5 : 2}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-tight ${
                active ? "text-accent" : "text-zinc-500"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------- SHARED ---------------- */
function TrustStrip() {
  return (
    <div className="flex items-stretch justify-between gap-2 py-3 px-1 border-y border-border/70">
      {[
        { k: "Accuracy", v: "98.2%" },
        { k: "Listings", v: "2.4M+" },
        { k: "Refreshed", v: "5m ago" },
      ].map((s) => (
        <div key={s.k} className="flex-1 flex flex-col items-center gap-0.5">
          <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            {s.k}
          </span>
          <span className="text-xs font-bold text-white">{s.v}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-sm uppercase tracking-[0.18em] text-zinc-500">
        {children}
      </h2>
      {action}
    </div>
  );
}

/* ---------------- SCAN TAB ---------------- */
function ScanTab() {
  const [mode, setMode] = useState<"text" | "shots">("text");
  const [text, setText] = useState("");
  const [tipOpen, setTipOpen] = useState(true);

  return (
    <div className="px-4 py-5 space-y-6">
      {tipOpen && (
        <div className="flex items-start gap-3 p-3 bg-surface border border-accent/20 rounded-xl relative">
          <Lightbulb className="size-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold mb-0.5">How FlipRadar works</p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Paste the listing text or upload screenshots — we cross-check it against millions of recent sales for an instant fair-price call.
            </p>
          </div>
          <button onClick={() => setTipOpen(false)} className="text-zinc-500 hover:text-white">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">
          Appraise Listing
        </h1>
        <p className="text-zinc-500 text-xs">
          Instant valuation via 2.4M local data points.
        </p>
      </div>

      <div className="flex p-1 bg-surface border border-border rounded-lg">
        <button
          onClick={() => setMode("text")}
          className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all ${
            mode === "text" ? "bg-zinc-800 text-white ring-1 ring-white/10" : "text-zinc-500"
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setMode("shots")}
          className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all ${
            mode === "shots" ? "bg-zinc-800 text-white ring-1 ring-white/10" : "text-zinc-500"
          }`}
        >
          Screenshots
        </button>
      </div>

      {mode === "text" ? (
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-44 bg-surface border border-border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-accent/50 placeholder:text-zinc-700 transition-colors resize-none"
            placeholder={`Paste the full listing here…

e.g. 2016 KTM RC390 — $3,500
31,000 kms. Great learner bike, runs well. Northern suburbs Melbourne.`}
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-600 uppercase">
            {text.length} chars
          </div>
        </div>
      ) : (
        <button className="w-full h-44 bg-surface border border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-accent/50 hover:text-white transition-colors">
          <Upload className="size-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Upload Screenshots</span>
          <span className="text-[10px] text-zinc-600">JPG · PNG · HEIC</span>
        </button>
      )}

      <button className="relative w-full bg-accent text-black font-display text-lg py-4 rounded-xl uppercase tracking-wide overflow-hidden transition-transform active:scale-[0.98]">
        <div className="absolute inset-0 bg-white/30 animate-scan pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Zap className="size-5" strokeWidth={2.5} fill="currentColor" />
          Scan This Deal
        </span>
      </button>

      <TrustStrip />

      <section>
        <SectionTitle
          action={
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider cursor-pointer">
              View All
            </span>
          }
        >
          Recent Appraisals
        </SectionTitle>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="aspect-[16/9] w-full relative bg-zinc-900">
            <img
              src={ktmImg}
              alt="2019 KTM RC390"
              loading="lazy"
              width={800}
              height={450}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 border border-white/10 rounded-sm flex items-center gap-1">
              <ShieldCheck className="size-3 text-accent" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-tighter">
                Verified
              </span>
            </div>
            <div className="absolute top-3 right-3 bg-accent text-black px-2 py-1 rounded-sm">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-tighter">
                Steal
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-tight uppercase font-display tracking-tight">
                  2019 KTM RC390
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                  31,000 KM · Melbourne, VIC
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Fair Price</div>
                <div className="font-mono text-xl font-bold leading-none animate-reveal">
                  $4,250
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Stat label="Asking" value="$3,500" />
              <Stat label="Market Low" value="$3,200" />
              <Stat label="Est. Profit" value="+$750" accent />
            </div>

            <button className="w-full py-3 border border-border font-bold text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-lg flex items-center justify-center gap-2">
              <Star className="size-3.5" />
              Save To Watchlist
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`p-2 rounded-lg border ${
        accent ? "bg-accent/5 border-accent/25" : "bg-zinc-900/60 border-border"
      }`}
    >
      <div
        className={`text-[9px] font-bold uppercase mb-1 tracking-wider ${
          accent ? "text-accent" : "text-zinc-500"
        }`}
      >
        {label}
      </div>
      <div className={`font-mono text-xs font-bold ${accent ? "text-accent" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

/* ---------------- WATCH TAB ---------------- */
function WatchTab() {
  const watches = [
    { name: "holden commodore", price: "Max $8,000", freq: "every 15 min", last: "1h ago" },
    { name: "ps5", price: "Any price", freq: "every 15 min", last: "1h ago" },
    { name: "bmw e36", price: "Max $12,000", freq: "every 15 min", last: "1h ago" },
    { name: "iphone 15 pro", price: "Max $1,200", freq: "every 30 min", last: "17m ago" },
  ];
  return (
    <div className="px-4 py-5 space-y-5">
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Watch</h1>
        <p className="text-zinc-500 text-xs leading-relaxed">
          Auto-scans Marketplace every 15–30 mins and posts new listings to your Feed.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            Your Plan
          </div>
          <div className="font-display text-2xl uppercase tracking-tight">Premium</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">4 / 8 watchlists used</div>
        </div>
        <div className="size-12 rounded-full bg-accent/10 border border-accent/30 grid place-items-center">
          <Star className="size-5 text-accent" fill="currentColor" />
        </div>
      </div>

      <button className="w-full py-3.5 border border-accent/40 bg-accent/5 text-accent font-bold text-[11px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-accent/10 transition">
        <Plus className="size-4" strokeWidth={2.5} />
        New Watchlist
      </button>

      <div className="space-y-2.5">
        {watches.map((w) => (
          <div
            key={w.name}
            className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3"
          >
            <div className="size-10 rounded-lg bg-accent/10 border border-accent/20 grid place-items-center shrink-0">
              <Search className="size-4 text-accent" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{w.name}</div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight">
                {w.price} · {w.freq} · {w.last}
              </div>
            </div>
            <button className="px-3 py-1.5 border border-danger/40 text-danger text-[10px] font-bold uppercase tracking-widest rounded hover:bg-danger/10">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- FEED TAB ---------------- */
function FeedTab() {
  const chips = ["holden commodore", "ps5", "bmw", "BMW e36", "iphone 15"];
  const [active, setActive] = useState(chips[0]);

  const listings = [
    { img: camryImg, title: "2012 Toyota Camry", price: "$9,000", fair: "$11,400", year: "2012", km: "244,000km", ago: "35m ago", loc: "Melbourne", tag: "STEAL" },
    { img: lexusImg, title: "2010 Lexus HS 250h", price: "$10,500", fair: "$10,200", year: "2010", km: "174,000km", ago: "35m ago", loc: "Melbourne", tag: "FAIR" },
    { img: bmwImg, title: "2019 BMW X1", price: "$22,900", fair: "$26,500", year: "2019", km: "78,000km", ago: "1h ago", loc: "Sydney", tag: "STEAL" },
    { img: ktmImg, title: "2019 KTM RC390", price: "$3,500", fair: "$4,250", year: "2019", km: "31,000km", ago: "2h ago", loc: "Melbourne", tag: "STEAL" },
  ];

  return (
    <div className="py-5 space-y-4">
      <div className="px-4 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Feed</h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent animate-pulse-dot" />
            Updated just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconBtn icon={RefreshCw} label="Refresh" />
          <IconBtn icon={Ban} label="Blocked" tone="warn" />
          <IconBtn icon={Trash2} label="Trash" tone="danger" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              active === c
                ? "bg-accent text-black"
                : "bg-surface border border-border text-zinc-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {listings.map((l) => (
          <ListingCard key={l.title} {...l} />
        ))}
      </div>

      <div className="px-4 pt-2">
        <div className="mx-auto w-fit bg-surface border border-border rounded-full px-4 py-2 flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" />
          <span className="text-[11px] font-bold text-accent">6 new listings found</span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof RefreshCw;
  label: string;
  tone?: "warn" | "danger";
}) {
  const color =
    tone === "danger"
      ? "border-danger/40 text-danger"
      : tone === "warn"
      ? "border-orange-500/40 text-orange-400"
      : "border-border text-zinc-300";
  return (
    <button
      aria-label={label}
      className={`size-9 grid place-items-center rounded-lg bg-surface border ${color}`}
    >
      <Icon className="size-4" />
    </button>
  );
}

function ListingCard({
  img, title, price, fair, year, km, ago, loc, tag,
}: {
  img: string; title: string; price: string; fair: string;
  year: string; km: string; ago: string; loc: string; tag: string;
}) {
  const isSteal = tag === "STEAL";
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-zinc-900">
        <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover" />
        <div
          className={`absolute top-2 left-2 px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase tracking-tighter ${
            isSteal ? "bg-accent text-black" : "bg-zinc-800 text-zinc-300 border border-white/10"
          }`}
        >
          {tag}
        </div>
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded">
          <span className="font-mono text-[9px] font-bold text-white uppercase">NEW</span>
        </div>
      </div>
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-[12px] font-bold leading-tight line-clamp-1">{title}</h3>
        <div className="flex items-baseline justify-between gap-1">
          <span className="font-mono text-base font-extrabold text-accent leading-none">
            {price}
          </span>
          <span className="font-mono text-[9px] text-zinc-500 uppercase">
            Fair {fair}
          </span>
        </div>
        <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-tight">
          {year} · {km}
        </div>
        <div className="text-[9px] text-zinc-600 font-mono uppercase">
          {ago} · {loc}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <button className="size-7 rounded grid place-items-center bg-zinc-900 border border-border">
            <Star className="size-3 text-zinc-400" />
          </button>
          <button className="size-7 rounded grid place-items-center bg-zinc-900 border border-border">
            <LinkIcon className="size-3 text-zinc-400" />
          </button>
          <button className="flex-1 h-7 rounded bg-accent/10 border border-accent/30 text-accent font-bold text-[10px] uppercase tracking-widest">
            Appraise
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- HISTORY TAB ---------------- */
function HistoryTab() {
  const flips = [
    { img: bmwImg, title: "2019 BMW X1", price: "$22,900", date: "27/5/2026", status: "WATCHING" },
    { img: camryImg, title: "2004 BMW E46 325Ci", price: "$11,000", date: "27/5/2026", status: "PASS" },
    { img: ktmImg, title: "2019 KTM RC390", price: "$3,500", date: "26/5/2026", status: "BOUGHT" },
  ];
  return (
    <div className="px-4 py-5 space-y-5">
      <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Your Flips</h1>

      <div className="bg-surface border border-border rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="grid grid-cols-3 divide-x divide-border">
          <BigStat label="Scanned" value="12" />
          <BigStat label="Steals 🔥" value="3" color="text-accent" />
          <BigStat label="Saved ★" value="5" color="text-yellow-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <SmallStat label="Bought" value="2" />
        <SmallStat label="Sold" value="1" />
        <SmallStat label="Profit" value="+$1,240" accent />
      </div>

      <button className="w-full py-3.5 border border-accent/40 bg-accent/5 text-accent font-bold text-[11px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-accent/10 transition">
        <Plus className="size-4" strokeWidth={2.5} />
        Log A Flip Manually
      </button>

      <div className="space-y-2.5">
        {flips.map((f) => (
          <div key={f.title} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <img src={f.img} alt={f.title} loading="lazy" className="size-14 rounded-lg object-cover bg-zinc-900" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{f.title}</div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">
                  {f.price} asking · {f.date}
                </div>
              </div>
              <StatusBadge status={f.status} />
              <ChevronRight className="size-4 text-zinc-600" />
            </div>
            <div className="px-3 pb-3">
              <button className="w-full py-2.5 border border-accent/30 bg-accent/5 text-accent font-bold text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5">
                <Banknote className="size-3.5" />
                Track Flip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BigStat({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
      <span className={`font-display text-3xl leading-none ${color}`}>{value}</span>
    </div>
  );
}

function SmallStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent ? "bg-accent/5 border-accent/30" : "bg-surface border-border"
      }`}
    >
      <div className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className={`font-display text-2xl leading-none ${accent ? "text-accent" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    BOUGHT: "bg-accent/10 text-accent border-accent/30",
    PASS: "bg-danger/10 text-danger border-danger/30",
    WATCHING: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded border font-mono text-[9px] font-extrabold uppercase tracking-widest ${map[status]}`}
    >
      {status}
    </span>
  );
}

/* ---------------- SELL TAB ---------------- */
function SellTab() {
  const [desc, setDesc] = useState("");
  return (
    <div className="px-4 py-5 space-y-5">
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight">Sell Scanner</h1>
        <p className="text-zinc-500 text-xs leading-relaxed">
          Photo something you own — get sell prices, timeframes, and a ready-to-post listing description.
        </p>
      </div>

      <button className="w-full bg-surface border-2 border-dashed border-zinc-700 rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-accent/50 transition-colors">
        <div className="size-14 rounded-2xl bg-accent/10 border border-accent/30 grid place-items-center">
          <Upload className="size-6 text-accent" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <div className="text-base font-bold">Upload a photo</div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono uppercase tracking-tight">
            Tap to choose · JPG · PNG · HEIC
          </div>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button className="w-full py-4 bg-surface border border-accent/30 text-accent font-bold text-sm rounded-xl flex items-center justify-center gap-2">
        <Camera className="size-5" />
        Take A Photo
      </button>

      <div className="relative">
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full h-32 bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-accent/50 placeholder:text-zinc-600 resize-none"
          placeholder="Describe your item (optional) e.g. 2019 Kymco Agility 50cc, 8000km, good condition, serviced, includes helmet…"
        />
      </div>

      <TrustStrip />

      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Backed by real sale data
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          We compare against 2.4M+ recent AU marketplace transactions — Gumtree, Facebook, Bikesales, eBay. No vibes, just numbers.
        </p>
      </div>
    </div>
  );
}
