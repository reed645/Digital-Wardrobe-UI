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

/* ─── Outfit operations ─────────────────────────────────────────────── */
export function addItemToOutfit(outfitId: string, item: SavedOutfitItem): void {
  records = records.map(r => {
    if (r.id !== outfitId) return r;
    // Check if item already exists in outfit
    if (r.outfitItems.some(i => i.id === item.id)) return r;
    return { ...r, outfitItems: [...r.outfitItems, item] };
  });
  notify();
}

export function getOutfitByDate(date: string): OutfitRecord | undefined {
  return records.find(r => r.date === date);
}

/* ─── Create or add to outfit ─────────────────────────────────────── */
export function addItemToTodayOutfit(item: SavedOutfitItem, date: string): void {
  const existingOutfit = records.find(r => r.date === date);
  
  if (existingOutfit) {
    // Add to existing outfit if not already present
    if (!existingOutfit.outfitItems.some(i => i.id === item.id)) {
      addItemToOutfit(existingOutfit.id, item);
    }
  } else {
    // Create new outfit for the date
    const newOutfit: OutfitRecord = {
      id: `user_${Date.now()}`,
      date: date,
      style: 'Casual',
      label: 'My Outfit',
      outfitItems: [item],
    };
    addOutfit(newOutfit);
  }
}
