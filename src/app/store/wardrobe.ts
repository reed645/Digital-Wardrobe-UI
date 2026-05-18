/* ─── Shared wardrobe store (pub-sub, no React dependency) ─────────── */
import imgWhiteShirt   from '../../imports/white-shirtt.png';
import imgWoolSweater  from '../../imports/Wool_Sweater.png';
import imgShirt        from '../../imports/shirt.png';
import imgGreenHoodie  from '../../imports/Cozy_green_hoodie.png';
import imgBlackHoodie  from '../../imports/Black_hoodie.png';
import imgShortPants   from '../../imports/short_pants.png';
import imgShortJeans   from '../../imports/Short_jeans.png';
import imgPant         from '../../imports/pant.png';
import imgJeansTrouser   from '../../imports/Jeans_Trouser.png';
/* ── Shoes ── */
import imgRunningShoes  from '../../imports/Running_Shoes.png';
import imgArmyBoots     from '../../imports/Black_army_Boots.png';
import imgWhiteSneakers from '../../imports/White_Sneakers.jpg';
import imgBlackShoe     from '../../imports/Black_Women_Shoe.png';
/* ── Accessories ── */
import imgPendant       from '../../imports/Love_Pendant.png';
import imgBlackScarf    from '../../imports/Black_Scarf.png';
import imgHandBag       from '../../imports/Ladies_Hand_Bag.png';
import imgBlackBag      from '../../imports/Black_Women_Bag.png';
/* ── Outerwear ── */
import imgFurCoat       from '../../imports/Fur_Coat_White.png';
import imgBrownCoat     from '../../imports/JV5ValTWqon74HBBj53sjUyzc07UOH1MPWOGg7AL1SFeKfVUUd3vV5UgT0c49op6D5Hm5jtXYHJrcR9sOvGhj49BWj8Y5uvxmnAq7hUMDgiCrErE4MD18aiyKE7p8COdRtgIthqJ34ObkDEKFhy5FEzrXKPGGhwFjf0i7viupU1x1Oc618ILI39mFy7jGAAG.jpg';
import imgJeans         from '../../imports/jeans.png';
import imgCargoPants    from '../../imports/Stylish_Olive_Cargo_Pants_with_Multiple_Pockets.png';
import imgFourPocketJacket from '../../imports/Four_Pocket_Jacket.png';
import imgBlueSweater   from '../../imports/blue_sweater-1.png';
import imgShoppingBag   from '../../imports/Shopping_Bag-1.png';

export interface ClothingItem {
  id: string;
  closetId?: string;   // visible label: C001, C002 … permanent unique ID
  name: string;
  type: string;
  color: string;
  colorHex: string;
  comment: string;
  wearCount: number;
  lastWorn?: string;   // ISO date string, e.g. "2026-05-10"
  styles: string[];
  seasons: string[];
  image?: string;
  emoji: string;
}

const INITIAL_WARDROBE: ClothingItem[] = [
  /* ── Tops ─────────────────────────────────────────────────────────── */
  { id:'t1', closetId:'C001', name:'White Shirt',     type:'Top', color:'White', colorHex:'#F5F5F5', comment:'', wearCount:7,  lastWorn:'2026-05-10', styles:['Casual','Minimal'],   seasons:['Spring','Summer'],       image:imgWhiteShirt,   emoji:'👕' },
  { id:'t2', closetId:'C002', name:'Wool Sweater',    type:'Top', color:'Beige', colorHex:'#D4BFA0', comment:'', wearCount:4,  lastWorn:'2026-05-05', styles:['Casual','Minimal'],   seasons:['Autumn','Winter'],       image:imgWoolSweater,  emoji:'🧥' },
  { id:'t3', closetId:'C003', name:'White Shirt',    type:'Top', color:'White', colorHex:'#F5F5F5', comment:'', wearCount:5,  lastWorn:'2026-05-08', styles:['Elegant','Minimal'],  seasons:['Spring','Autumn'],       image:imgShirt,        emoji:'👔' },
  { id:'t4', closetId:'C004', name:'Green Hoodie',    type:'Top', color:'Green', colorHex:'#4ADE80', comment:'', wearCount:3,  lastWorn:'2025-12-01', styles:['Casual','Sporty'],    seasons:['Autumn','Winter'],       image:imgGreenHoodie,  emoji:'🧥' },
  { id:'t6', closetId:'C023', name:'Blue Sweater',    type:'Top', color:'Blue',  colorHex:'#4A90D9', comment:'', wearCount:0,  lastWorn:'2025-10-15', styles:['Casual','Minimal'],   seasons:['Autumn','Winter'],       image:imgBlueSweater,  emoji:'👕' },
  { id:'t5', closetId:'C005', name:'Black Hoodie',    type:'Top', color:'Black', colorHex:'#1A1A1A', comment:'', wearCount:6,  lastWorn:'2026-05-12', styles:['Casual','Street'],    seasons:['Autumn','Winter'],       image:imgBlackHoodie,  emoji:'🧥' },
  /* ── Bottoms ───────────────────────────────────────────────────────── */
  { id:'b1', closetId:'C006', name:'Khaki Shorts',    type:'Bottom', color:'Green', colorHex:'#4ADE80', comment:'', wearCount:4,  lastWorn:'2026-04-20', styles:['Casual'],             seasons:['Spring','Summer'],   image:imgShortPants,   emoji:'🩳' },
  { id:'b2', closetId:'C007', name:'Denim Shorts',    type:'Bottom', color:'Blue',  colorHex:'#5B8DB8', comment:'', wearCount:6,  lastWorn:'2026-04-25', styles:['Casual','Street'],    seasons:['Summer'],   image:imgShortJeans,   emoji:'🩳' },
  { id:'b3', closetId:'C008', name:'Beige Trousers',  type:'Bottom', color:'Beige', colorHex:'#D4BFA0', comment:'', wearCount:8,  lastWorn:'2026-05-11', styles:['Elegant','Minimal'],  seasons:['Spring','Autumn'],   image:imgPant,         emoji:'👖' },
  { id:'b4', closetId:'C009', name:'Dark Wash Jeans', type:'Bottom', color:'Navy',  colorHex:'#2C3E6B', comment:'', wearCount:11, lastWorn:'2026-05-14', styles:['Casual','Minimal'],   seasons:['Autumn','Winter'],   image:imgJeansTrouser, emoji:'👖' },
  { id:'c020', closetId:'C020', name:'Blue Jeans',      type:'Bottom',    color:'Blue',  colorHex:'#5B8DB8', comment:'', wearCount:1,  lastWorn:'2025-11-20', styles:['Casual'],             seasons:['Spring','Summer','Autumn'],       image:imgJeans,      emoji:'👖' },
  { id:'c021', closetId:'C021', name:'Black Cargo Pants',type:'Bottom',    color:'Black', colorHex:'#2C2C2C', comment:'', wearCount:1,  lastWorn:'2025-12-15', styles:['Casual','Street'],    seasons:['Spring','Summer','Autumn','Winter'], image:imgCargoPants, emoji:'👖' },
  /* ── Shoes ────────────────────────────────────────────────────────── */
  { id:'s1', closetId:'C010', name:'Running Shoes',   type:'Shoes', color:'White', colorHex:'#F5F5F5', comment:'', wearCount:9,  lastWorn:'2026-05-09', styles:['Sporty'],             seasons:['Spring','Summer'],   image:imgRunningShoes,  emoji:'👟' },
  { id:'s2', closetId:'C011', name:'Army Boots',      type:'Shoes', color:'Black', colorHex:'#1A1A1A', comment:'', wearCount:5,  lastWorn:'2026-04-28', styles:['Street','Casual'],    seasons:['Autumn','Winter'],   image:imgArmyBoots,     emoji:'🥾' },
  { id:'s3', closetId:'C012', name:'White Sneakers',  type:'Shoes', color:'White', colorHex:'#F5F5F5', comment:'', wearCount:12, lastWorn:'2026-05-15', styles:['Casual','Minimal'],   seasons:['Spring','Summer'],   image:imgWhiteSneakers, emoji:'👟' },
  { id:'s4', closetId:'C013', name:'Black Heels',     type:'Shoes', color:'Black', colorHex:'#1A1A1A', comment:'', wearCount:4,  lastWorn:'2026-04-18', styles:['Elegant'],            seasons:['Spring','Autumn'],   image:imgBlackShoe,     emoji:'👠' },
  /* ── Accessories ──────────────────────────────────────────────────── */
  { id:'a1', closetId:'C014', name:'Love Pendant',    type:'Accessories', color:'Gold',  colorHex:'#D4AF37', comment:'', wearCount:6,  lastWorn:'2026-05-06', styles:['Elegant','Cute'],     seasons:['Spring','Summer','Autumn','Winter'], image:imgPendant,    emoji:'📿' },
  { id:'a2', closetId:'C015', name:'Black Scarf',     type:'Accessories', color:'Black', colorHex:'#1A1A1A', comment:'', wearCount:8,  lastWorn:'2026-02-10', styles:['Casual','Minimal'],   seasons:['Autumn','Winter'],                  image:imgBlackScarf, emoji:'🧣' },
  { id:'a3', closetId:'C016', name:'Ladies Handbag',  type:'Accessories', color:'Beige', colorHex:'#D4BFA0', comment:'', wearCount:10, lastWorn:'2026-05-13', styles:['Elegant','Minimal'],  seasons:['Spring','Summer'],                  image:imgHandBag,    emoji:'👜' },
  { id:'a4', closetId:'C017', name:'Black Bag',       type:'Accessories', color:'Black', colorHex:'#1A1A1A', comment:'', wearCount:7,  lastWorn:'2026-05-07', styles:['Street','Elegant'],   seasons:['Autumn','Winter'],                  image:imgBlackBag,   emoji:'👜' },
  { id:'a5', closetId:'C024', name:'Shopping Bag',   type:'Accessories', color:'Tan',   colorHex:'#C8A96E', comment:'', wearCount:1,  lastWorn:'2025-11-05', styles:['Casual','Minimal'],   seasons:['Spring','Summer'],                  image:imgShoppingBag, emoji:'👜' },
  /* ── Outerwear ────────────────────────────────────────────────────── */
  { id:'o1', closetId:'C018', name:'White Fur Coat',  type:'Outerwear', color:'White', colorHex:'#F5F5F5', comment:'', wearCount:3,  lastWorn:'2026-01-20', styles:['Elegant','Cute'],     seasons:['Winter'],            image:imgFurCoat,    emoji:'🧥' },
  { id:'o2', closetId:'C019', name:'White Suit',      type:'Outerwear', color:'White', colorHex:'#F5F5F5', comment:'', wearCount:5,  lastWorn:'2026-04-22', styles:['Casual','Minimal'],   seasons:['Autumn','Winter'],   image:imgBrownCoat,  emoji:'🧥' },
  { id:'o3', closetId:'C022', name:'Blue Jacket',     type:'Outerwear', color:'Blue',  colorHex:'#3B82F6', comment:'', wearCount:0,  lastWorn:'2025-10-01', styles:['Casual','Street'],    seasons:['Spring','Autumn'],   image:imgFourPocketJacket, emoji:'🧥' },
];

let items: ClothingItem[] = [...INITIAL_WARDROBE];
const listeners = new Set<() => void>();

function notify() { listeners.forEach(fn => fn()); }

export function getItems(): ClothingItem[]            { return [...items]; }
export function addItem(item: ClothingItem)           { items = [item, ...items]; notify(); }
export function updateItem(updated: ClothingItem)     { items = items.map(i => i.id === updated.id ? updated : i); notify(); }
export function removeItem(id: string)                { items = items.filter(i => i.id !== id); notify(); }
export function subscribeWardrobe(fn: () => void)     { listeners.add(fn); return () => listeners.delete(fn); }

export function getNextClosetId(): string {
  const nums = items
    .map(i => i.closetId)
    .filter(Boolean)
    .map(cid => parseInt(cid!.replace('C', ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `C${String(next).padStart(3, '0')}`;
}

/* ─── Item operations ─────────────────────────────────────────────── */
export function markAsWorn(id: string, date: string): void {
  items = items.map(i => {
    if (i.id !== id) return i;
    return { ...i, wearCount: i.wearCount + 1, lastWorn: date };
  });
  notify();
}

export function getItemById(id: string): ClothingItem | undefined {
  return items.find(i => i.id === id);
}

/* ─── Derived helpers ───────────────────────────────────────────────── */
export function getItemByClosetId(closetId: string): ClothingItem | undefined {
  return items.find(i => i.closetId === closetId);
}

export function getIdleItems(count = 3): ClothingItem[] {
  return [...items].sort((a, b) => a.wearCount - b.wearCount).slice(0, count);
}
export function getRecentItems(count = 3): ClothingItem[] {
  return [...items].slice(0, count);
}
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach(i => { counts[i.type] = (counts[i.type] ?? 0) + 1; });
  return counts;
}
