/* ─── Shared outfit records store (pub-sub, no React dependency) ─── */

export interface SavedOutfitItem {
  id: string;
  type: string;
  emoji: string;
  color: string;
  colorHex: string;
  image?: string;
  name?: string;
}

export interface OutfitRecord {
  id: string;
  date: string;            // YYYY-MM-DD
  style: string;
  label?: string;
  mannequinImage?: string; // full outfit photo → main Grid card preview
  avatarImage?: string;    // pixel avatar photo → Calendar date cell preview
  outfitItems: SavedOutfitItem[];
}

let records: OutfitRecord[] = [];
const listeners = new Set<() => void>();

function notify() { listeners.forEach(fn => fn()); }

export function getOutfits(): OutfitRecord[]     { return [...records]; }
export function addOutfit(o: OutfitRecord)       { records = [o, ...records]; notify(); }
export function updateOutfit(o: OutfitRecord)    { records = records.map(r => r.id === o.id ? o : r); notify(); }
export function deleteOutfit(id: string)         { records = records.filter(r => r.id !== id); notify(); }
export function subscribeOutfits(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }

export function setInitialOutfits(initial: OutfitRecord[]) {
  if (records.length === 0) {
    records = [...initial];
    notify();
  }
}
