/* ─── Outfit Collections store (pub-sub, no React dependency) ─────── */

export interface OutfitCollection {
  id: string;
  name: string;
  purpose: string;   // Travel | Work Week | Formal | Casual | Seasonal | Custom
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  outfitIds: string[];
  coverImage?: string;
}

let collections: OutfitCollection[] = [];
const listeners = new Set<() => void>();

function notify() { listeners.forEach(fn => fn()); }

export function getCollections(): OutfitCollection[]         { return [...collections]; }
export function addCollection(c: OutfitCollection)           { collections = [c, ...collections]; notify(); }
export function updateCollection(c: OutfitCollection)        { collections = collections.map(x => x.id === c.id ? c : x); notify(); }
export function deleteCollection(id: string)                 { collections = collections.filter(c => c.id !== id); notify(); }
export function subscribeCollections(fn: () => void)         { listeners.add(fn); return () => listeners.delete(fn); }

export function addOutfitToCollection(collectionId: string, outfitId: string) {
  collections = collections.map(c =>
    c.id === collectionId && !c.outfitIds.includes(outfitId)
      ? { ...c, outfitIds: [...c.outfitIds, outfitId] }
      : c
  );
  notify();
}

export function setInitialCollections(initial: OutfitCollection[]) {
  if (collections.length === 0) { collections = [...initial]; notify(); }
}
