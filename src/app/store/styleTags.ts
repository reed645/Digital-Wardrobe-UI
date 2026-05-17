/* ─── Global style tags store (pub-sub, no React dependency) ─────── */
const DEFAULT = ['Casual','Minimal','Cute','Sporty','Street','Elegant','Vintage','Formal'];
let tags: string[] = [...DEFAULT];
const listeners = new Set<()=>void>();

export function getStyles():  string[] { return [...tags]; }
export function addStyle(tag: string) {
  const t = tag.trim();
  if (t && !tags.includes(t)) { tags = [...tags, t]; listeners.forEach(fn=>fn()); }
}
export function subscribeStyles(fn: ()=>void) {
  listeners.add(fn); return () => listeners.delete(fn);
}
