const BASE = 'https://api.flip-radar.app';
const TOKEN_KEY = 'flipradar_token';
const USER_KEY  = 'flipradar_user';

// ── Token helpers ─────────────────────────────────────────
export const getToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token: string): void => {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
};
export const clearToken = (): void => {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
};
export const getCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch { return null; }
};
export const setCachedUser = (user: User): void => {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
};

// ── Types ─────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name?: string;
  plan?: string;
}

export interface Watch {
  id: string;
  keyword: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  location?: string | null;
  plan?: string;
  lastScanned?: string | null;
  paused?: boolean;
}

export interface CreateWatchPayload {
  keyword: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  location?: string | null;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  location?: string | null;
  year?: number | null;
  mileage?: number | null;
  make?: string | null;
  model?: string | null;
  transmission?: string | null;
  url: string;
  keyword: string;
  priceDropped?: boolean;
  previousPrice?: number;
  dropAmount?: number;
  isOfferPrice?: boolean;
  description?: string | null;
  listedAt?: string;
  foundAt?: string;
}

export interface AppraisalResult {
  verdict: 'STEAL' | 'GOOD DEAL' | 'FAIR' | 'PASS';
  dealScore: number;
  oneLiner: string;
  estimatedMarketValue: number;
  estimatedResellLow: number;
  estimatedResellHigh: number;
  estimatedProfit: number;
  roiPercent: number;
  recommendedOffer: number;
  walkAwayPrice: number;
  greenFlags: string[];
  redFlags: string[];
  whatToCheckInPerson: string[];
  negotiationScript: string;
  timeToSell: string;
  demandLevel: string;
  whyItsWorth: string;
  isBrokenOrProject?: boolean;
  repairEstimate?: number;
  repairNotes?: string;
  extractedTitle?: string;
  extractedPrice?: number;
  extractedMileage?: number | null;
}

export interface PlanInfo {
  plan: string;
  appraisalsUsedToday: number;
  appraisalsLimit: number;
  watchlistLimit: number;
}

// ── Core fetch ────────────────────────────────────────────
async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> ?? {}) },
  });

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event('flipradar:unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  let data: unknown;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error((data as Record<string, string>).error ?? `HTTP ${res.status}`);
  return data as T;
}

// ── JSON extraction from AI text responses ────────────────
// /ai/text-image and /ai/text return { text: "...json..." }
// /ai/vehicle returns the object directly
function extractJson(data: unknown): AppraisalResult {
  if (data && typeof data === 'object' && 'verdict' in (data as object)) {
    return data as AppraisalResult;
  }
  const text = (data as Record<string, string>).text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not read the scan result. Try again.');
  try { return JSON.parse(match[0]) as AppraisalResult; } catch {
    throw new Error('Could not parse AI response. Try again.');
  }
}

// ── API surface ───────────────────────────────────────────
export const api = {
  // Auth
  login: (email: string, password: string) =>
    req<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  signup: (email: string, password: string, name: string) =>
    req<{ token: string; user: User }>('/auth/signup', {
      method: 'POST', body: JSON.stringify({ email, password, name }),
    }),
  plan: () => req<PlanInfo>('/auth/plan'),

  // Watches
  getWatches: () => req<Watch[]>('/watches'),
  createWatch: (payload: CreateWatchPayload) =>
    req<Watch>('/watches', { method: 'POST', body: JSON.stringify(payload) }),
  deleteWatch: (id: string) =>
    req<unknown>(`/watches/${id}`, { method: 'DELETE' }),

  // Listings
  getListings:   () => req<Listing[]>('/listings'),
  getPriceDrops: () => req<Listing[]>('/listings/price-drops'),

  // AI — vehicle path (structured fields → rich AI response at top level)
  appraiseVehicle: async (payload: {
    make: string; model: string; year: number;
    mileage?: number | null; transmission?: string | null;
    listingPrice: number; title: string; description?: string;
    imageUrl?: string | null;
  }): Promise<AppraisalResult> => {
    const data = await req<unknown>('/ai/vehicle', {
      method: 'POST', body: JSON.stringify(payload),
    });
    return extractJson(data);
  },

  // AI — text/image path (prompt → { text: "...json..." })
  appraiseText: async (payload: {
    prompt: string; imageUrl?: string | null;
  }): Promise<AppraisalResult> => {
    const data = await req<unknown>('/ai/text-image', {
      method: 'POST', body: JSON.stringify(payload),
    });
    return extractJson(data);
  },
};

// ── Scan history (localStorage) ───────────────────────────
const HIST_KEY = 'fr_hist';
export interface HistoryEntry {
  id: number;
  title: string;
  price: number;
  image?: string | null;
  url?: string | null;
  date: string;
  result: AppraisalResult;
}
export const getHistory = (): HistoryEntry[] => {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]') as HistoryEntry[]; } catch { return []; }
};
export const pushHistory = (entry: HistoryEntry): void => {
  const hist = getHistory();
  hist.unshift(entry);
  try { localStorage.setItem(HIST_KEY, JSON.stringify(hist.slice(0, 50))); } catch {}
};
export const clearHistory = (): void => {
  try { localStorage.removeItem(HIST_KEY); } catch {}
};
export const calcTotalProfit = (): number => {
  return getHistory().reduce((sum, e) => {
    const v = e.result?.verdict;
    return sum + (v === 'STEAL' || v === 'GOOD DEAL' ? (e.result.estimatedProfit ?? 0) : 0);
  }, 0);
};

// ── Saved listings (localStorage) ────────────────────────
const SAVED_KEY = 'fr_saved';
type SavedMap = Record<string, Listing>;
export const getSaved    = (): SavedMap => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '{}') as SavedMap; } catch { return {}; } };
export const saveListing = (l: Listing): void  => { const m = getSaved(); m[l.id] = l; try { localStorage.setItem(SAVED_KEY, JSON.stringify(m)); } catch {} };
export const unsaveListing = (id: string): void => { const m = getSaved(); delete m[id]; try { localStorage.setItem(SAVED_KEY, JSON.stringify(m)); } catch {} };
export const isListingSaved = (id: string): boolean => id in getSaved();
