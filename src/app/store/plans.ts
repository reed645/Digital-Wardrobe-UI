/* ─── Outfit Plans store (pub-sub, no React dependency) ──────────── */

export interface PlanDaySlot {
  dayLabel: string;   // "12 May" (date range) or "Day 1" (number of days)
  date?: string;      // YYYY-MM-DD — set only in dateRange mode
  outfitIds: string[];
}

export interface OutfitPlan {
  id: string;
  planName: string;
  planningType: 'dateRange' | 'numberOfDays';
  purpose?: string;
  dateFrom?: string;
  dateTo?: string;
  numberOfDays?: number;
  planDaySlots: PlanDaySlot[];
}

let plans: OutfitPlan[] = [];
const listeners = new Set<() => void>();

function notify() { listeners.forEach(fn => fn()); }

export function getPlans(): OutfitPlan[]              { return [...plans]; }
export function addPlan(p: OutfitPlan)                { plans = [p, ...plans]; notify(); }
export function updatePlan(p: OutfitPlan)             { plans = plans.map(x => x.id === p.id ? p : x); notify(); }
export function deletePlan(id: string)                { plans = plans.filter(p => p.id !== id); notify(); }
export function subscribePlans(fn: () => void)        { listeners.add(fn); return () => listeners.delete(fn); }

export function setInitialPlans(initial: OutfitPlan[]) {
  if (plans.length === 0) { plans = [...initial]; notify(); }
}
