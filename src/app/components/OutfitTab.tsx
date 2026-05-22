import { useState, useRef, useEffect } from 'react';
import { Calendar, CalendarDays, Plus, Minus, Sparkles, X, Check, ChevronLeft, ChevronRight, MoreHorizontal, Camera, Folders, BookmarkPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getItems, subscribeWardrobe, getItemByClosetId, ClothingItem } from '../store/wardrobe';
import { getStyles, subscribeStyles } from '../store/styleTags';
import {
  OutfitCollection, getCollections, addCollection, updateCollection,
  deleteCollection, subscribeCollections, addOutfitToCollection, setInitialCollections,
} from '../store/collections';
import {
  getOutfits, addOutfit, updateOutfit, deleteOutfit,
  subscribeOutfits, setInitialOutfits,
  OutfitRecord, SavedOutfitItem,
} from '../store/outfits';
import {
  OutfitPlan, PlanDaySlot, getPlans, addPlan, updatePlan, deletePlan,
  subscribePlans, setInitialPlans,
} from '../store/plans';
import { getCalendarYear, getTodayDate, getYesterdayDate, getMonthNames, getStyleTags } from '../../data/index';

/* ── May 2 outfit assets ─────────────────────────────────────────── */
import mannequin_may2  from '../../imports/file_00000000ac6c7206b0ffc4af338ca472.png';
import avatar_may2     from '../../imports/file_000000009b4c7207acc65bca74088e0b.png';
/* ── May 6 outfit assets ─────────────────────────────────────────── */
import mannequin_may6  from '../../imports/file_000000004d3c71fa83b0fc076565130c.png';
import avatar_may6     from '../../imports/file_00000000dad472098b367017fe90c1df.png';
/* ── May 9 outfit assets ─────────────────────────────────────────── */
import mannequin_may9  from '../../imports/file_00000000fa48720981ed96a40f5d5d67.png';
import avatar_may9     from '../../imports/file_000000000d7c7206badf63333abfad20.png';

/* ── Helper: convert ClothingItem → SavedOutfitItem ──────────────── */
function toSavedItem(item: ClothingItem): SavedOutfitItem {
  return { id: item.id, type: item.type, emoji: item.emoji, color: item.color, colorHex: item.colorHex, image: item.image, name: item.name };
}

/* ── Wardrobe lookups for preset outfits ─────────────────────────── */
// O001 — 2 May
const _c023 = getItemByClosetId('C023'); // Blue Sweater
const _c008 = getItemByClosetId('C008'); // Black Trousers
const _c011 = getItemByClosetId('C011'); // Army Boots
const _c024 = getItemByClosetId('C024'); // Shopping Bag
// O002 — 6 May
const _c004 = getItemByClosetId('C004'); // Green Hoodie
const _c020 = getItemByClosetId('C020'); // Blue Jeans
const _c010 = getItemByClosetId('C010'); // Running Shoes
// O003 — 9 May
const _c003 = getItemByClosetId('C003'); // Oxford Shirt
const _c022 = getItemByClosetId('C022'); // Blue Jacket
const _c021 = getItemByClosetId('C021'); // Black Cargo Pants
const _c012 = getItemByClosetId('C012'); // White Sneakers
const _c017 = getItemByClosetId('C017'); // Black Bag

/* ── Seed preset outfit records (runs once at module load) ───────── */
setInitialOutfits([
  {
    id: 'O001',
    date: '2026-05-02',
    style: 'Casual',
    label: '2 May Outfit',
    mannequinImage: mannequin_may2,
    avatarImage: avatar_may2,
    showInGrid: true,
    showInCalendar: true,
    outfitItems: [_c023, _c008, _c011, _c024].filter(Boolean).map(i => toSavedItem(i!)),
  },
  {
    id: 'O002',
    date: '2026-05-06',
    style: 'Casual',
    label: '6 May Outfit',
    mannequinImage: mannequin_may6,
    avatarImage: avatar_may6,
    showInGrid: true,
    showInCalendar: true,
    outfitItems: [_c004, _c020, _c010].filter(Boolean).map(i => toSavedItem(i!)),
  },
  {
    id: 'O003',
    date: '2026-05-09',
    style: 'Casual',
    label: '9 May Outfit',
    mannequinImage: mannequin_may9,
    avatarImage: avatar_may9,
    showInGrid: true,
    showInCalendar: true,
    outfitItems: [_c003, _c022, _c021, _c012, _c017].filter(Boolean).map(i => toSavedItem(i!)),
  },
]);

/* ── Seed demo collections ───────────────────────────────────────── */
setInitialCollections([
  { id:'COL001', name:'Melbourne Trip',  purpose:'Travel',      dateFrom:'2026-05-02', dateTo:'2026-05-06', outfitIds:['O001','O002'] },
  { id:'COL002', name:'Work Week',       purpose:'Work Week',   dateFrom:'2026-05-12', dateTo:'2026-05-16', outfitIds:['O003'] },
  { id:'COL003', name:'Formal Events',   purpose:'Formal',      outfitIds:[] },
]);

/* ── Seed demo outfit plans ──────────────────────────────────────── */
setInitialPlans([
  {
    id:'PLN001', planName:'Melbourne Trip', planningType:'dateRange', purpose:'Travel',
    dateFrom:'2026-05-12', dateTo:'2026-05-16',
    planDaySlots:[
      { dayLabel:'12 May', date:'2026-05-12', outfitIds:['O001'] },
      { dayLabel:'13 May', date:'2026-05-13', outfitIds:['O003'] },
      { dayLabel:'14 May', date:'2026-05-14', outfitIds:['O002'] },
      { dayLabel:'15 May', date:'2026-05-15', outfitIds:['O001'] },
      { dayLabel:'16 May', date:'2026-05-16', outfitIds:[] },
    ],
  },
  {
    id:'PLN002', planName:'Work Week', planningType:'numberOfDays', numberOfDays:5,
    planDaySlots:[
      { dayLabel:'Day 1', outfitIds:['O003'] },
      { dayLabel:'Day 2', outfitIds:['O002'] },
      { dayLabel:'Day 3', outfitIds:['O001'] },
      { dayLabel:'Day 4', outfitIds:[] },
      { dayLabel:'Day 5', outfitIds:[] },
    ],
  },
  {
    id:'PLN003', planName:'Weekend Looks', planningType:'numberOfDays', numberOfDays:2,
    planDaySlots:[
      { dayLabel:'Day 1', outfitIds:['O002'] },
      { dayLabel:'Day 2', outfitIds:[] },
    ],
  },
]);

/* ── Tokens ──────────────────────────────────────────────────────── */
const PAGE_BG      = '#F8F7FF';
const CARD_BORDER  = '1px solid #EEEDFE';
const DM           = { fontFamily:"'DM Sans',sans-serif" };
const TITLE_FONT   = { fontFamily:"'Playfair Display',Georgia,serif", fontStyle:'italic' as const };
const CAL_YEAR     = getCalendarYear();
const TODAY_STR    = getTodayDate();
const YESTERDAY    = getYesterdayDate();
const MONTH_NAMES  = getMonthNames();
const STYLES_LIST  = getStyleTags();
const STYLE_FILTERS = ['All', ...STYLES_LIST];

type WardrobeItem = SavedOutfitItem;
interface CanvasItem { cid: string; item: WardrobeItem; x: number; y: number; }

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' });
}
function formatShort(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-AU', { day:'numeric', month:'long' });
}
function formatBarDate(d: string): string {
  if (d === TODAY_STR) return `Today, ${new Date(TODAY_STR + 'T12:00:00').getDate()} ${MONTH_NAMES[new Date(TODAY_STR + 'T12:00:00').getMonth()]}`;
  if (d === YESTERDAY) return `Yesterday, ${new Date(YESTERDAY + 'T12:00:00').getDate()} ${MONTH_NAMES[new Date(YESTERDAY + 'T12:00:00').getMonth()]}`;
  return formatDate(d);
}

/* ═══════════════════════════════════════════════════════════════════
   PixelAvatarPreview — SVG fallback when no real avatar image
═══════════════════════════════════════════════════════════════════ */
function PixelAvatarPreview({
  outfitItems, size = 'medium',
}: { outfitItems: SavedOutfitItem[]; size?: 'tiny'|'small'|'medium' }) {
  const topColor  = outfitItems.find(i => i.type==='Top'||i.type==='Outerwear')?.colorHex ?? '#EEEDFE';
  const botColor  = outfitItems.find(i => i.type==='Bottom')?.colorHex ?? '#AFA9EC';
  const shoeColor = outfitItems.find(i => i.type==='Shoes')?.colorHex ?? '#7F77DD';
  const [w,h]     = size==='tiny' ? [16,24] : size==='small' ? [22,34] : [38,56];
  return (
    <svg viewBox="0 0 20 30" width={w} height={h} fill="none">
      <ellipse cx="10" cy="4"    rx="3.5" ry="3.5" fill="#F4C49A"/>
      <rect x="9"    y="7"  width="2"   height="2"  rx="0.5" fill="#F4C49A"/>
      <rect x="6"    y="9"  width="8"   height="8"  rx="1.5" fill={topColor}/>
      <rect x="3"    y="9"  width="3"   height="6"  rx="1.2" fill={topColor}/>
      <rect x="14"   y="9"  width="3"   height="6"  rx="1.2" fill={topColor}/>
      <rect x="6"    y="17" width="3.5" height="8"  rx="1.2" fill={botColor}/>
      <rect x="10.5" y="17" width="3.5" height="8"  rx="1.2" fill={botColor}/>
      <ellipse cx="7.75"  cy="27" rx="3" ry="1.5" fill={shoeColor}/>
      <ellipse cx="12.25" cy="27" rx="3" ry="1.5" fill={shoeColor}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ClosetItemCard — right-panel drag card in Create Outfit
═══════════════════════════════════════════════════════════════════ */
function ClosetItemCard({
  item, added, onPointerDown,
}: { item: WardrobeItem; added: boolean; onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-2 py-2 select-none cursor-grab active:cursor-grabbing"
      style={{ background:added?'#EDE9FE':'white', border:added?'2px solid #3D35A8':CARD_BORDER, touchAction:'none' }}
      onPointerDown={onPointerDown}>
      <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width:34, height:42, background:item.colorHex+'33' }}>
        {item.image
          ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{item.emoji}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize:9.5, fontWeight:600, color:'#1a1560', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {item.name ?? item.type}
        </p>
        <p style={{ fontSize:9, color:'#AFA9EC', marginBottom:2 }}>{item.color}</p>
        <span style={{ fontSize:8, background:'#F0EEFF', color:'#7F77DD', borderRadius:999, padding:'1px 5px', fontWeight:600 }}>
          {item.type}
        </span>
      </div>
      {added && <Check size={11} color="#3D35A8" className="flex-shrink-0"/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CanvasTile — draggable + resizable item on canvas
═══════════════════════════════════════════════════════════════════ */
function CanvasTile({
  ci, containerRef, selected, onSelect, onRemove,
}: {
  ci: CanvasItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  selected: boolean;
  onSelect: (cid: string) => void;
  onRemove: (cid: string) => void;
}) {
  const posRef = useRef({ x:ci.x, y:ci.y });
  const [pos,   setPos]   = useState({ x:ci.x, y:ci.y });
  const [scale, setScale] = useState(1.0);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation(); e.preventDefault();
    onSelect(ci.cid);
    const el = e.currentTarget; el.setPointerCapture(e.pointerId);
    const rect = containerRef.current!.getBoundingClientRect();
    const sx=e.clientX, sy=e.clientY, ox=posRef.current.x, oy=posRef.current.y;
    function onMove(ev: PointerEvent) {
      const nx = Math.max(0, Math.min(74, ox + ((ev.clientX-sx)/rect.width)*100));
      const ny = Math.max(0, Math.min(72, oy + ((ev.clientY-sy)/rect.height)*100));
      posRef.current = { x:nx, y:ny }; setPos({ x:nx, y:ny });
    }
    el.addEventListener('pointermove', onMove as EventListener);
    el.addEventListener('pointerup', () => el.removeEventListener('pointermove', onMove as EventListener), { once:true });
  }

  const w = Math.round(56 * scale), h = Math.round(72 * scale);
  return (
    <div className="absolute select-none"
      style={{ left:`${pos.x}%`, top:`${pos.y}%`, touchAction:'none', zIndex:selected?20:10 }}
      onPointerDown={handlePointerDown}>
      <div className="relative flex flex-col items-center">
        <div className="rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ width:w, height:h, background:'white',
            border: selected ? '2px solid #3D35A8' : '1.5px solid #EEEDFE',
            boxShadow: selected ? '0 0 0 3px rgba(61,53,168,0.15)' : 'none' }}>
          {ci.item.image
            ? <img src={ci.item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.round(24*scale) }}>{ci.item.emoji}</div>}
        </div>
        <button className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-20"
          style={{ background:'#EF4444' }}
          onPointerDown={e => { e.stopPropagation(); onRemove(ci.cid); }}>
          <X size={10} color="white" strokeWidth={3}/>
        </button>
        <div className="flex gap-0.5 mt-1" onPointerDown={e => e.stopPropagation()}>
          <button onClick={() => setScale(s => +(Math.max(0.6, s-0.2)).toFixed(1))}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
            style={{ background:'#EEEDFE', color:'#3D35A8', border:CARD_BORDER, fontSize:12, lineHeight:1 }}>−</button>
          <button onClick={() => setScale(s => +(Math.min(1.8, s+0.2)).toFixed(1))}
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
            style={{ background:'#EEEDFE', color:'#3D35A8', border:CARD_BORDER, fontSize:12, lineHeight:1 }}>+</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ClosetItemSheet — bottom sheet shown when a clothing thumbnail is tapped
═══════════════════════════════════════════════════════════════════ */
function ClosetItemSheet({ item, onClose }: { item: SavedOutfitItem; onClose: () => void }) {
  const full = getItems().find(i => i.id === item.id);
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background:'rgba(26,21,96,0.35)' }}
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl pb-8"
        style={{ boxShadow:'0 -8px 40px rgba(61,53,168,0.18)' }}
        onClick={e => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div style={{ width:36, height:4, borderRadius:99, background:'#EEEDFE' }}/>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            {full?.closetId && (
              <span style={{ fontSize:10, fontWeight:800, background:'#EEEDFE', color:'#3D35A8',
                borderRadius:999, padding:'2px 8px' }}>{full.closetId}</span>
            )}
            <p style={{ fontSize:16, fontWeight:700, color:'#1a1560' }}>{item.name ?? item.type}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background:'#F0EEFF' }}>
            <X size={14} color="#3D35A8"/>
          </button>
        </div>
        {/* Image */}
        <div className="mx-4 rounded-2xl overflow-hidden mb-4 flex items-center justify-center"
          style={{ height:200, background: item.colorHex + '22', border: CARD_BORDER }}>
          {item.image
            ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
            : <span style={{ fontSize:56 }}>{item.emoji}</span>}
        </div>
        {/* Meta */}
        <div className="px-4 flex flex-wrap gap-2">
          <div className="rounded-xl px-3 py-2 flex-1" style={{ background:'#F8F7FF', border:CARD_BORDER }}>
            <p style={{ fontSize:9, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em' }}>Type</p>
            <p style={{ fontSize:13, fontWeight:600, color:'#1a1560', marginTop:2 }}>{item.type}</p>
          </div>
          <div className="rounded-xl px-3 py-2 flex-1" style={{ background:'#F8F7FF', border:CARD_BORDER }}>
            <p style={{ fontSize:9, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em' }}>Color</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div style={{ width:12, height:12, borderRadius:'50%', background:item.colorHex, border:'1.5px solid #EEEDFE' }}/>
              <p style={{ fontSize:13, fontWeight:600, color:'#1a1560' }}>{item.color}</p>
            </div>
          </div>
          {full && (
            <div className="rounded-xl px-3 py-2 flex-1" style={{ background:'#F8F7FF', border:CARD_BORDER }}>
              <p style={{ fontSize:9, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em' }}>Worn</p>
              <p style={{ fontSize:13, fontWeight:600, color:'#1a1560', marginTop:2 }}>{full.wearCount}×</p>
            </div>
          )}
        </div>
        {full?.styles && full.styles.length > 0 && (
          <div className="px-4 mt-3 flex flex-wrap gap-1.5">
            {full.styles.map(s => (
              <span key={s} style={{ fontSize:10, fontWeight:600, background:'#EDE9FE', color:'#3D35A8',
                borderRadius:999, padding:'3px 10px' }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OutfitRecordCard — grid card for a saved outfit
   Main cover = full mannequin image (or item collage fallback)
   Badge      = pixel avatar image (or SVG fallback)
═══════════════════════════════════════════════════════════════════ */
function OutfitRecordCard({
  outfit, onTap, onEdit, onItemTap, onAddToCollection,
}: { outfit: OutfitRecord; onTap: () => void; onEdit: () => void; onItemTap: (item: SavedOutfitItem) => void; onAddToCollection?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbItems = outfit.outfitItems.slice(0, 4);
  const extraCount = Math.max(0, outfit.outfitItems.length - 4);

  /* Fallback collage positions (used only when no mannequinImage) */
  const coverItems = outfit.outfitItems.slice(0, 3);
  const POSITIONS  = [
    [{ l:60, t:66 }],
    [{ l:23, t:66 }, { l:98, t:66 }],
    [{ l:4,  t:36 }, { l:60, t:76 }, { l:116, t:36 }],
  ][Math.min(coverItems.length, 3) - 1] ?? [{ l:60, t:66 }];

  return (
    <div className="bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{ border:CARD_BORDER }} onClick={onTap}>

      {/* ── Cover ── */}
      <div className="relative overflow-hidden" style={{ height:200, background:'#EEEDFE' }}>
        {outfit.mannequinImage
          ? <img src={outfit.mannequinImage}
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }} alt=""/>
          : coverItems.length > 0
            ? coverItems.map((item, i) => (
                <div key={i} className="absolute overflow-hidden rounded-xl"
                  style={{ left:POSITIONS[i]?.l??4, top:POSITIONS[i]?.t??36,
                    width:52, height:68, border:'2px solid white', background:item.colorHex+'44' }}>
                  {item.image
                    ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{item.emoji}</div>}
                </div>
              ))
            : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Camera size={28} color="#C4BDFF" strokeWidth={1.5}/>
                <p style={{ fontSize:10, color:'#C4BDFF', fontWeight:600 }}>Photo pending</p>
              </div>
            )
        }

        {/* Photo-pending banner overlay (when items exist but no mannequin photo) */}
        {!outfit.mannequinImage && coverItems.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 py-1"
            style={{ background:'rgba(0,0,0,0.30)' }}>
            <Camera size={10} color="white" strokeWidth={2}/>
            <span style={{ fontSize:8.5, color:'white', fontWeight:600 }}>Photo pending</span>
          </div>
        )}

        {/* Pixel avatar badge */}
        <div className="absolute top-2 right-2 z-10 bg-white rounded-xl p-1.5"
          style={{ border:CARD_BORDER, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
          {outfit.avatarImage
            ? <img src={outfit.avatarImage} style={{ width:26, height:36, objectFit:'contain' }} alt=""/>
            : <PixelAvatarPreview outfitItems={outfit.outfitItems} size="small"/>}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <p style={{ fontSize:13, fontWeight:700, color:'#1a1560', lineHeight:1.3, flex:1, marginRight:6 }}>
            {outfit.label ?? 'Untitled Outfit'}
          </p>
          <div className="relative flex-shrink-0" onPointerDown={e => e.stopPropagation()}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:'#F0EEFF' }}>
              <MoreHorizontal size={14} color="#3D35A8"/>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 bg-white rounded-2xl py-1 min-w-[148px]"
                style={{ boxShadow:'0 4px 20px rgba(61,53,168,0.18)', border:CARD_BORDER }}>
                <button className="w-full px-4 py-2.5 text-left flex items-center gap-2"
                  style={{ fontSize:13, color:'#1a1560', fontWeight:500 }}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}>
                  Edit Outfit
                </button>
                {onAddToCollection && (
                  <button className="w-full px-4 py-2.5 text-left flex items-center gap-2"
                    style={{ fontSize:13, color:'#1a1560', fontWeight:500 }}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onAddToCollection(); }}>
                    <BookmarkPlus size={13} color="#7F77DD"/> Add to Collection
                  </button>
                )}
                <div style={{ height:1, background:'#F0EEFF', margin:'2px 0' }}/>
                <button className="w-full px-4 py-2.5 text-left"
                  style={{ fontSize:13, color:'#EF4444', fontWeight:500 }}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}>
                  Delete Outfit
                </button>
              </div>
            )}
          </div>
        </div>
        <p style={{ fontSize:10, color:'#AFA9EC', marginBottom:4 }}>{formatDate(outfit.date)}</p>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="rounded-full px-2 py-0.5"
            style={{ background:'#F0EEFF', color:'#3D35A8', fontSize:9, fontWeight:700 }}>
            {outfit.style}
          </span>
          <span style={{ fontSize:10, color:'#AFA9EC' }}>{outfit.outfitItems.length} items</span>
        </div>

        {/* Thumbnail row */}
        <div className="flex gap-1.5 items-center">
          {thumbItems.map((item, i) => (
            <button key={i} onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onItemTap(item); }}
              style={{ width:28, height:34, borderRadius:6, overflow:'hidden',
                background:item.colorHex+'33', border:CARD_BORDER, flexShrink:0, padding:0 }}>
              {item.image
                ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>{item.emoji}</div>}
            </button>
          ))}
          {extraCount > 0 && (
            <div style={{ width:28, height:34, borderRadius:6, background:'#F0EEFF',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:8, fontWeight:700, color:'#3D35A8' }}>+{extraCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OutfitCalendarCell — calendar day with real pixel avatar image
═══════════════════════════════════════════════════════════════════ */
function OutfitCalendarCell({
  dayNum, isValid, isToday, isSelected, dayOutfits, onClick,
}: {
  dayNum: number; isValid: boolean; isToday: boolean; isSelected: boolean;
  dayOutfits: OutfitRecord[]; onClick: () => void;
}) {
  const hasOutfit  = isValid && dayOutfits.length > 0;
  const extraCount = dayOutfits.length - 1;
  const first      = dayOutfits[0];

  return (
    <button onClick={() => isValid && onClick()}
      className="relative flex flex-col items-center pt-1"
      style={{
        height:56, borderRadius:8,
        background: isToday ? '#3D35A8' : isSelected ? '#EDE9FE' : 'transparent',
        border: isSelected && !isToday ? '1.5px solid #3D35A8' : 'none',
      }}>
      <span style={{
        fontSize:11, fontWeight: isToday||isSelected ? 700 : 400, lineHeight:1.2,
        color: isValid ? (isToday ? 'white' : '#1a1560') : '#DDD8FF',
      }}>
        {isValid ? dayNum : ''}
      </span>

      {hasOutfit && (
        <div className="relative flex items-center justify-center mt-0.5">
          {first.avatarImage
            ? <img src={first.avatarImage}
                style={{ width:18, height:24, objectFit:'contain', borderRadius:2 }} alt=""/>
            : first.outfitItems.length > 0
              ? <PixelAvatarPreview outfitItems={first.outfitItems} size="tiny"/>
              : <Camera size={12} color={isToday ? 'rgba(255,255,255,0.6)' : '#C4BDFF'} strokeWidth={1.5}/>}
          {extraCount > 0 && (
            <div style={{
              position:'absolute', top:-2, right:-6,
              width:12, height:12, borderRadius:'50%',
              background: isToday ? 'white' : '#3D35A8',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:6.5, fontWeight:700, color: isToday ? '#3D35A8' : 'white' }}>
                +{extraCount}
              </span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MiniCalendarPicker — inside the date picker sheet
═══════════════════════════════════════════════════════════════════ */
function MiniCalendarPicker({
  currentDate, onSelect, onBack,
}: { currentDate: string; onSelect: (d: string) => void; onBack: () => void }) {
  const [month, setMonth] = useState(4);
  const firstDay    = new Date(CAL_YEAR, month, 1).getDay();
  const daysInMonth = new Date(CAL_YEAR, month + 1, 0).getDate();
  const selDay      = currentDate.startsWith(`${CAL_YEAR}-${String(month+1).padStart(2,'0')}`)
    ? parseInt(currentDate.split('-')[2]) : -1;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="flex items-center gap-1" style={{ color:'#7F77DD', fontSize:13 }}>
          <ChevronLeft size={15}/> Back
        </button>
        <div className="flex items-center justify-between flex-1">
          <button onClick={() => setMonth(m => (m-1+12)%12)}
            className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:'#F0EEFF' }}>
            <ChevronLeft size={13} color="#3D35A8"/>
          </button>
          <span style={{ fontSize:13, fontWeight:700, color:'#1a1560' }}>{MONTHS[month]} {CAL_YEAR}</span>
          <button onClick={() => setMonth(m => (m+1)%12)}
            className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:'#F0EEFF' }}>
            <ChevronRight size={13} color="#3D35A8"/>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <div key={i} className="font-semibold py-1" style={{ color:'#AFA9EC', fontSize:10 }}>{d}</div>
        ))}
        {Array.from({ length:42 }, (_, i) => {
          const day   = i - firstDay + 1;
          const isVal = day >= 1 && day <= daysInMonth;
          const isSel = isVal && day === selDay;
          const isTod = month === 4 && day === 14;
          return (
            <button key={i} onClick={() => {
              if (!isVal) return;
              onSelect(`${CAL_YEAR}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
            }}
              className="aspect-square flex items-center justify-center rounded-lg"
              style={{
                background: isTod ? '#3D35A8' : isSel ? '#EDE9FE' : 'transparent',
                color: isVal ? (isTod ? 'white' : '#1a1560') : '#E0DEFC',
                fontSize:11, fontWeight: isSel||isTod ? 700 : 400,
              }}>
              {isVal ? day : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DatePickerSheet — bottom sheet for date selection
═══════════════════════════════════════════════════════════════════ */
function DatePickerSheet({
  currentDate, onSelect, onClose,
}: { currentDate: string; onSelect: (d: string) => void; onClose: () => void }) {
  const [showCal, setShowCal] = useState(false);
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" style={{ background:'rgba(0,0,0,0.25)' }}>
      <div className="bg-white rounded-t-3xl p-5 pb-8 shadow-2xl">
        {!showCal ? (
          <>
            <p style={{ fontSize:15, fontWeight:700, color:'#1a1560', marginBottom:14 }}>Choose outfit date</p>
            {[
              { label:'Today',     sub: formatDate(TODAY_STR), date: TODAY_STR },
              { label:'Yesterday', sub: formatDate(YESTERDAY),  date: YESTERDAY  },
            ].map(opt => (
              <button key={opt.label} onClick={() => { onSelect(opt.date); onClose(); }}
                className="w-full flex items-center justify-between py-3.5"
                style={{ borderBottom:CARD_BORDER }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#1a1560' }}>{opt.label}</span>
                <span style={{ fontSize:12, color:'#AFA9EC' }}>{opt.sub}</span>
              </button>
            ))}
            <button onClick={() => setShowCal(true)}
              className="w-full flex items-center justify-between py-3.5"
              style={{ borderBottom:CARD_BORDER }}>
              <span style={{ fontSize:14, fontWeight:600, color:'#1a1560' }}>Pick another date</span>
              <ChevronRight size={16} color="#AFA9EC"/>
            </button>
            <button onClick={onClose} className="w-full pt-3.5 text-center"
              style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>Cancel</button>
          </>
        ) : (
          <MiniCalendarPicker
            currentDate={currentDate}
            onSelect={d => { onSelect(d); onClose(); }}
            onBack={() => setShowCal(false)}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OutfitSaveBar — name input + style chips + date + save button
═══════════════════════════════════════════════════════════════════ */
function OutfitSaveBar({
  canvasCount, saveDate, saveStyle, saveName,
  onDateTap, onStyleChange, onNameChange, onSave,
}: {
  canvasCount: number; saveDate: string; saveStyle: string; saveName: string;
  onDateTap: () => void; onStyleChange: (s: string) => void;
  onNameChange: (n: string) => void; onSave: () => void;
}) {
  const [stylesList, setStylesList] = useState<string[]>(getStyles());
  useEffect(() => subscribeStyles(() => setStylesList(getStyles())), []);
  const canSave = canvasCount > 0;
  return (
    <div style={{ background:PAGE_BG, borderTop:CARD_BORDER, flexShrink:0 }}>
      {/* Name input */}
      <div className="px-3 pt-2.5 pb-1">
        <input value={saveName} onChange={e => onNameChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2 outline-none"
          style={{ background:'white', border:CARD_BORDER, fontSize:12, fontWeight:600,
            color:'#1a1560', fontFamily:"'DM Sans',sans-serif" }}
          placeholder="Outfit name…"/>
      </div>
      {/* Style chips */}
      <div className="px-3 py-1 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
        {stylesList.map(s => (
          <button key={s} onClick={() => onStyleChange(s)}
            className="flex-shrink-0 px-3 h-7 rounded-full text-xs font-semibold"
            style={{ background:saveStyle===s?'#3D35A8':'#F0EEFF', color:saveStyle===s?'white':'#7F77DD' }}>
            {s}
          </button>
        ))}
      </div>
      {/* Date + Save */}
      <div className="px-3 pb-4 pt-1 flex gap-2">
        <button onClick={onDateTap}
          className="flex items-center gap-1.5 rounded-full px-3 h-11 flex-shrink-0"
          style={{ background:'white', border:CARD_BORDER, color:'#3D35A8', fontSize:11, fontWeight:600 }}>
          <Calendar size={12}/> {formatBarDate(saveDate)}
        </button>
        <button onClick={onSave} disabled={!canSave}
          className="flex-1 h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5"
          style={{ background:canSave?'#1A1A40':'#EEEDFE', color:canSave?'white':'#AFA9EC' }}>
          <Check size={14}/> Save Outfit{canSave ? ` (${canvasCount})` : ''}
        </button>
      </div>
    </div>
  );
}

/* ── Demo assets pool for Try-On simulation ──────────────────────── */
const DEMO_TRYON = [
  { mannequin: mannequin_may9, avatar: avatar_may9 },
  { mannequin: mannequin_may6, avatar: avatar_may6 },
  { mannequin: mannequin_may2, avatar: avatar_may2 },
];

/* ═══════════════════════════════════════════════════════════════════
   TryOnView — virtual try-on screen
   Uses pre-prepared demo assets to simulate AI outfit generation.
═══════════════════════════════════════════════════════════════════ */
function TryOnView({ canvasItems, onBack, onSave, onAddToCalendar }: {
  canvasItems: CanvasItem[];
  onBack: () => void;
  onSave: (mannequinImage: string, avatarImage: string) => void;
  onAddToCalendar: (mannequinImage: string, avatarImage: string) => void;
}) {
  const [phase, setPhase] = useState<'loading'|'result'>('loading');
  const [peekedItem, setPeekedItem] = useState<SavedOutfitItem|null>(null);

  const demo = DEMO_TRYON[0];

  useEffect(() => {
    const t = setTimeout(() => setPhase('result'), 2000);
    return () => clearTimeout(t);
  }, []);

  /* Loading screen */
  if (phase === 'loading') return (
    <div className="h-full flex flex-col items-center justify-center gap-6" style={{ background:PAGE_BG }}>
      <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background:'#EDE9FE' }}>
        <Sparkles size={40} color="#3D35A8" className="animate-pulse"/>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#3D35A8] border-[#EEEDFE] animate-spin"/>
      </div>
      <div className="text-center">
        <p style={{ fontSize:17, fontWeight:700, color:'#1a1560', ...DM }}>Styling your look…</p>
        <p style={{ fontSize:12, color:'#AFA9EC', marginTop:4 }}>AI is generating your outfit preview</p>
      </div>
    </div>
  );

  /* Result screen */
  return (
    <div className="h-full flex flex-col overflow-hidden relative" style={{ background:PAGE_BG, ...DM }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom:CARD_BORDER }}>
        <button onClick={onBack} className="flex items-center gap-1" style={{ color:'#7F77DD', fontSize:14 }}>
          <ChevronLeft size={18}/> Edit
        </button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:20, color:'#1a1560' }}>Virtual Try-On</h2>
        <button onClick={() => onSave(demo.mannequin, demo.avatar)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white"
          style={{ background:'#3D35A8' }}>
          <Check size={13}/> Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* AI badge */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background:'#EDE9FE', border:'1px solid #D8D3FF' }}>
            <Sparkles size={11} color="#3D35A8"/>
            <span style={{ fontSize:10, fontWeight:700, color:'#3D35A8' }}>AI Generated Result</span>
          </div>
        </div>

        {/* Main preview: mannequin + avatar side by side */}
        <div className="flex items-start justify-center gap-4 px-4 pb-4">
          {/* Large mannequin */}
          <div className="flex-1 rounded-2xl overflow-hidden"
            style={{ maxWidth:220, background:'#F0EEFF', border:CARD_BORDER }}>
            <img src={demo.mannequin}
              style={{ width:'100%', aspectRatio:'3/5', objectFit:'cover', objectPosition:'top', display:'block' }} alt=""/>
          </div>

          {/* Pixel avatar panel */}
          <div className="flex flex-col items-center gap-2 pt-2" style={{ width:80 }}>
            <div className="rounded-2xl overflow-hidden bg-white p-2"
              style={{ border:CARD_BORDER, boxShadow:'0 2px 12px rgba(61,53,168,0.10)' }}>
              <img src={demo.avatar}
                style={{ width:60, height:96, objectFit:'contain', display:'block' }} alt=""/>
            </div>
            <div className="text-center">
              <p style={{ fontSize:9, fontWeight:700, color:'#3D35A8', lineHeight:1.3 }}>Calendar</p>
              <p style={{ fontSize:9, fontWeight:700, color:'#3D35A8', lineHeight:1.3 }}>Avatar</p>
            </div>
          </div>
        </div>

        {/* Outfit pieces */}
        <div className="mx-4 bg-white rounded-2xl p-4 mb-4" style={{ border:CARD_BORDER }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1a1560', marginBottom:12 }}>Outfit pieces</p>
          <div className="space-y-2.5">
            {canvasItems.map(ci => (
              <button key={ci.cid} className="flex items-center gap-3 w-full text-left"
                onClick={() => setPeekedItem(ci.item)}>
                <div className="rounded-xl overflow-hidden flex-shrink-0"
                  style={{ width:42, height:52, background:ci.item.colorHex+'33', border:CARD_BORDER }}>
                  {ci.item.image
                    ? <img src={ci.item.image} className="w-full h-full object-cover" alt=""/>
                    : <div className="w-full h-full flex items-center justify-center text-xl">{ci.item.emoji}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize:13, fontWeight:600, color:'#1a1560', overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {ci.item.name ?? ci.item.type}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {'id' in ci.item && (ci.item as any).closetId && (
                      <span style={{ fontSize:8.5, fontWeight:700, background:'#EEEDFE', color:'#3D35A8',
                        borderRadius:999, padding:'1px 6px' }}>
                        {(ci.item as any).closetId}
                      </span>
                    )}
                    <span style={{ fontSize:10, color:'#AFA9EC' }}>{ci.item.type}</span>
                  </div>
                </div>
                <div style={{ width:28, height:28, borderRadius:'50%', background:ci.item.colorHex,
                  flexShrink:0, border:'2px solid white', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}/>
              </button>
            ))}
          </div>
        </div>

        {/* Add to Outfit Records CTA */}
        <div className="px-4">
          <button onClick={() => onAddToCalendar(demo.mannequin, demo.avatar)}
            className="w-full h-13 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background:'#1A1A40', height:52 }}>
            <Check size={16}/> Add to Outfit Records
          </button>
          <p style={{ fontSize:10, color:'#AFA9EC', textAlign:'center', marginTop:8 }}>
            Outfit will appear in Calendar only
          </p>
        </div>
      </div>

      {peekedItem && <ClosetItemSheet item={peekedItem} onClose={() => setPeekedItem(null)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CreateOutfitView — full create screen
═══════════════════════════════════════════════════════════════════ */
function CreateOutfitView({
  onCancel, onSave, wardrobe, initialDate,
}: {
  onCancel: () => void;
  onSave: (items: CanvasItem[], date: string, style: string, name: string, mannequinImage?: string, avatarImage?: string) => void;
  wardrobe: WardrobeItem[];
  initialDate?: string;
}) {
  const [canvasItems,   setCanvasItems]   = useState<CanvasItem[]>([]);
  const [selectedCid,   setSelectedCid]   = useState<string|null>(null);
  const [pickerFilter,  setPickerFilter]  = useState('All');
  const [showTryOn,     setShowTryOn]     = useState(false);
  const [ghost,         setGhost]         = useState<{ item: WardrobeItem; x: number; y: number }|null>(null);
  const [saveDate,      setSaveDate]      = useState(initialDate ?? TODAY_STR);
  const [saveStyle,     setSaveStyle]     = useState('Casual');
  const [saveName,      setSaveName]      = useState('Untitled Outfit');
  const [showDateSheet, setShowDateSheet] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const PICKER_CATS = ['All','Top','Bottom','Shoes','Outerwear','Accessories'];
  const filtered    = wardrobe.filter(w => pickerFilter==='All' || w.type===pickerFilter);
  const canSave     = canvasItems.length > 0;

  function startDrag(item: WardrobeItem, startX: number, startY: number) {
    setGhost({ item, x:startX, y:startY });
    function onMove(e: PointerEvent) { setGhost({ item, x:e.clientX, y:e.clientY }); }
    function onUp(e: PointerEvent) {
      document.removeEventListener('pointermove', onMove);
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        if (e.clientX>=rect.left && e.clientX<=rect.right && e.clientY>=rect.top && e.clientY<=rect.bottom) {
          const px  = Math.max(0, Math.min(74, ((e.clientX-rect.left)/rect.width)*100));
          const py  = Math.max(0, Math.min(72, ((e.clientY-rect.top)/rect.height)*100));
          const cid = `${item.id}_${Date.now()}`;
          setCanvasItems(prev => [...prev, { cid, item, x:px, y:py }]);
          setSelectedCid(cid);
        }
      }
      setGhost(null);
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once:true });
  }

  function removeItem(cid: string) {
    setCanvasItems(prev => prev.filter(c => c.cid !== cid));
    if (selectedCid === cid) setSelectedCid(null);
  }

  if (showTryOn) return (
    <TryOnView canvasItems={canvasItems} onBack={() => setShowTryOn(false)}
      onSave={(mannequin, avatar) => {
        if (canSave) onSave(canvasItems, saveDate, saveStyle, saveName, mannequin, avatar, false);
      }}
      onAddToCalendar={(mannequin, avatar) => {
        if (canSave) onSave(canvasItems, saveDate, saveStyle, saveName, mannequin, avatar, true);
      }}/>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:PAGE_BG, ...DM }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3"
        style={{ borderBottom:CARD_BORDER, background:PAGE_BG, flexShrink:0 }}>
        <button onClick={onCancel} style={{ fontSize:14, color:'#7F77DD', fontWeight:500 }}>Cancel</button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:20, color:'#1a1560' }}>Create Outfit</h2>
        <div style={{ width:52 }}/>
      </div>

      {/* Hint bar */}
      <div className="px-4 py-2 text-center flex-shrink-0" style={{ background:'#F0EEFF', borderBottom:CARD_BORDER }}>
        <p style={{ fontSize:11, color:'#3D35A8', fontWeight:500 }}>
          {canvasItems.length===0
            ? 'Drag items onto canvas · tap to select · +/− to resize'
            : `${canvasItems.length} item${canvasItems.length>1?'s':''} on canvas`}
        </p>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden" onClick={() => setSelectedCid(null)}>
        {/* Canvas */}
        <div className="flex flex-col" style={{ width:'57%', borderRight:CARD_BORDER }}>
          <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom:CARD_BORDER }}>
            <p style={{ fontSize:9, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.07em' }}>Canvas</p>
            {canvasItems.length>0 && (
              <button onClick={e => { e.stopPropagation(); setCanvasItems([]); setSelectedCid(null); }}
                style={{ fontSize:9, color:'#EF4444', fontWeight:600 }}>Clear</button>
            )}
          </div>
          <div ref={canvasRef} className="flex-1 relative overflow-hidden"
            style={{ background:'repeating-linear-gradient(0deg,transparent,transparent 23px,#EEEDFE 23px,#EEEDFE 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,#EEEDFE 23px,#EEEDFE 24px)' }}>
            {canvasItems.length===0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor:'#AFA9EC' }}>
                  <Plus size={22} color="#AFA9EC"/>
                </div>
                <p style={{ fontSize:11, color:'#AFA9EC', textAlign:'center', paddingInline:16, lineHeight:1.5 }}>
                  Drag items here
                </p>
              </div>
            )}
            {canvasItems.map(ci => (
              <CanvasTile key={ci.cid} ci={ci} containerRef={canvasRef}
                selected={selectedCid===ci.cid}
                onSelect={setSelectedCid} onRemove={removeItem}/>
            ))}
          </div>
          {/* Try On */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderTop:CARD_BORDER }}>
            <button onClick={() => canSave && setShowTryOn(true)} disabled={!canSave}
              className="w-full h-9 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background:'white', border:CARD_BORDER, color:canSave?'#3D35A8':'#AFA9EC' }}>
              <Sparkles size={12}/> Try On
            </button>
          </div>
        </div>

        {/* Item picker */}
        <div className="flex flex-col" style={{ width:'43%' }}>
          <div className="px-2 py-1.5 flex-shrink-0" style={{ borderBottom:CARD_BORDER }}>
            <div className="flex gap-1 flex-wrap">
              {PICKER_CATS.map(cat => (
                <button key={cat} onClick={e => { e.stopPropagation(); setPickerFilter(cat); }}
                  className="px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{ background:pickerFilter===cat?'#3D35A8':'#F0EEFF',
                    color:pickerFilter===cat?'white':'#7F77DD', fontSize:9 }}>
                  {cat==='Accessories'?'Acc':cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filtered.map(w => (
              <ClosetItemCard key={w.id} item={w}
                added={canvasItems.some(c => c.item.id===w.id)}
                onPointerDown={e => { e.stopPropagation(); e.preventDefault(); startDrag(w, e.clientX, e.clientY); }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <OutfitSaveBar
        canvasCount={canvasItems.length}
        saveDate={saveDate} saveStyle={saveStyle} saveName={saveName}
        onDateTap={() => setShowDateSheet(true)}
        onStyleChange={setSaveStyle} onNameChange={setSaveName}
        onSave={() => { if (canSave) onSave(canvasItems, saveDate, saveStyle, saveName, undefined, undefined); }}
      />

      {showDateSheet && (
        <DatePickerSheet currentDate={saveDate} onSelect={setSaveDate} onClose={() => setShowDateSheet(false)}/>
      )}

      {/* Drag ghost */}
      {ghost && (
        <div style={{ position:'fixed', left:ghost.x-28, top:ghost.y-36, width:56, height:72, zIndex:9999,
          pointerEvents:'none', borderRadius:12, background:'white', border:'2px solid #3D35A8', overflow:'hidden',
          boxShadow:'0 8px 24px rgba(61,53,168,0.3)' }}>
          {ghost.item.image
            ? <img src={ghost.item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
            : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:4 }}>
                <span style={{ fontSize:26 }}>{ghost.item.emoji}</span>
                <span style={{ fontSize:8, color:'#7F77DD', fontWeight:600 }}>{ghost.item.type}</span>
              </div>}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CalendarOutfitCard — compact card for calendar day lower section
   Shows: mannequin thumbnail + info + large pixel avatar on right
═══════════════════════════════════════════════════════════════════ */
function CalendarOutfitCard({ outfit, onTap, onItemTap }: { outfit: OutfitRecord; onTap: () => void; onItemTap: (item: SavedOutfitItem) => void }) {
  return (
    <div className="bg-white rounded-2xl cursor-pointer" style={{ border:CARD_BORDER, padding:'10px' }} onClick={onTap}>
      <div className="flex gap-3 items-center">
        {/* Left: dashed border container with horizontal scroll of item photos */}
        <div style={{
          flex:1,
          border:'1.5px dashed #AFA9EC',
          borderRadius:12,
          padding:8,
          display:'flex',
          overflowX:'auto',
          gap:6,
          scrollbarWidth:'none',
          WebkitOverflowScrolling:'touch',
          minHeight:80,
        }}>
          {outfit.outfitItems.map((item, i) => (
            <button key={i}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onItemTap(item); }}
              style={{
                width:56,
                height:64,
                borderRadius:10,
                overflow:'hidden',
                flexShrink:0,
                background:'#F8F7FF',
                border:CARD_BORDER,
                padding:0
              }}>
              {item.image
                ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:18 }}>{item.emoji}</div>}
            </button>
          ))}
        </div>

        {/* Right: pixel avatar + outfit label (vertical layout) */}
        <div style={{ width:85, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:80 }}>
            {outfit.avatarImage
              ? <img src={outfit.avatarImage} style={{ width:68, height:96, objectFit:'contain' }} alt=""/>
              : <PixelAvatarPreview outfitItems={outfit.outfitItems} size="medium"/>}
          </div>
          <p style={{ fontSize:11, fontWeight:600, color:'#7F77DD', textAlign:'center', lineHeight:1.2 }}>
            {outfit.label ?? 'Outfit'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OutfitDetailView — tapping an outfit card opens this
═══════════════════════════════════════════════════════════════════ */
function OutfitDetailView({
  outfit, onBack, onEdit, onWearToday,
}: { outfit: OutfitRecord; onBack: () => void; onEdit: () => void; onWearToday: () => void }) {
  const [peekedItem, setPeekedItem] = useState<SavedOutfitItem|null>(null);
  return (
    <div className="h-full overflow-y-auto pb-10 relative" style={{ background:PAGE_BG, ...DM }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3"
        style={{ borderBottom:CARD_BORDER, background:PAGE_BG }}>
        <button onClick={onBack} className="flex items-center gap-1"
          style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>
          <ChevronLeft size={18}/> Back
        </button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:20, color:'#1a1560' }}>Outfit Detail</h2>
        <button onClick={onEdit} style={{ color:'#3D35A8', fontSize:13, fontWeight:700 }}>Edit</button>
      </div>

      {/* Mannequin hero image */}
      <div className="relative" style={{ background:'#EEEDFE', minHeight:300 }}>
        {outfit.mannequinImage
          ? <img src={outfit.mannequinImage}
              style={{ width:'100%', height:340, objectFit:'contain', objectPosition:'center' }} alt=""/>
          : <div style={{ height:260, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <PixelAvatarPreview outfitItems={outfit.outfitItems} size="medium"/>
            </div>}

        {/* Pixel avatar badge */}
        {outfit.avatarImage && (
          <div className="absolute top-3 right-3 bg-white rounded-2xl p-2"
            style={{ border:CARD_BORDER, boxShadow:'0 2px 12px rgba(0,0,0,0.1)' }}>
            <img src={outfit.avatarImage} style={{ width:44, height:60, objectFit:'contain' }} alt=""/>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="px-4 py-4">
        <h3 style={{ fontSize:22, fontWeight:800, color:'#1a1560', marginBottom:6 }}>
          {outfit.label ?? 'Untitled Outfit'}
        </h3>
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span style={{ fontSize:12, color:'#AFA9EC' }}>{formatDate(outfit.date)}</span>
          <span className="rounded-full px-2.5 py-1"
            style={{ background:'#F0EEFF', color:'#3D35A8', fontSize:11, fontWeight:700 }}>
            {outfit.style}
          </span>
          <span style={{ fontSize:12, color:'#AFA9EC' }}>{outfit.outfitItems.length} items</span>
        </div>

        {/* Clothing items */}
        <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase',
          letterSpacing:'0.06em', marginBottom:10 }}>Clothing Items</p>
        <div className="flex gap-2 flex-wrap mb-6">
          {outfit.outfitItems.map((item, i) => (
            <button key={i} className="flex flex-col items-center gap-1"
              onClick={() => setPeekedItem(item)}>
              <div style={{ width:56, height:70, borderRadius:12, overflow:'hidden',
                background:item.colorHex+'33', border:CARD_BORDER }}>
                {item.image
                  ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:22 }}>{item.emoji}</div>}
              </div>
              <p style={{ fontSize:9, color:'#AFA9EC', fontWeight:500, textAlign:'center',
                maxWidth:56, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.name ?? item.type}
              </p>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onEdit}
            className="flex-1 h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background:'#3D35A8', color:'white' }}>
            Edit Outfit
          </button>
        </div>
        <button onClick={onWearToday}
          className="w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 mt-2"
          style={{ background:'#F0EEFF', color:'#3D35A8', border:CARD_BORDER }}>
          <Check size={14}/> Wear Today
        </button>
      </div>

      {peekedItem && <ClosetItemSheet item={peekedItem} onClose={() => setPeekedItem(null)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EditOutfitView — rename, re-date, re-style, add/remove items, delete
═══════════════════════════════════════════════════════════════════ */
function EditOutfitView({
  outfit, wardrobe, onBack, onSaved, onDeleted,
}: {
  outfit: OutfitRecord; wardrobe: WardrobeItem[];
  onBack: () => void; onSaved: (updated: OutfitRecord) => void; onDeleted: () => void;
}) {
  const [label,             setLabel]             = useState(outfit.label ?? 'Untitled Outfit');
  const [date,              setDate]              = useState(outfit.date);
  const [style,             setStyle]             = useState(outfit.style);
  const [items,             setItems]             = useState(outfit.outfitItems);
  const [showDateSheet,     setShowDateSheet]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSave() {
    const updated: OutfitRecord = { ...outfit, label, date, style, outfitItems: items };
    updateOutfit(updated);
    onSaved(updated);
  }

  function handleDelete() {
    deleteOutfit(outfit.id);
    onDeleted();
  }

  const addableItems = wardrobe.filter(w => !items.find(it => it.id === w.id));

  return (
    <div className="h-full relative overflow-hidden" style={{ ...DM }}>
      <div className="h-full overflow-y-auto pb-10" style={{ background:PAGE_BG }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-10 pb-3"
          style={{ borderBottom:CARD_BORDER, background:PAGE_BG }}>
          <button onClick={onBack} style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>Cancel</button>
          <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:20, color:'#1a1560' }}>Edit Outfit</h2>
          <button onClick={handleSave} style={{ color:'#3D35A8', fontSize:14, fontWeight:700 }}>Save</button>
        </div>

        {/* Current preview */}
        {(outfit.mannequinImage || outfit.avatarImage) && (
          <div className="flex gap-3 px-4 py-4" style={{ borderBottom:CARD_BORDER }}>
            {outfit.mannequinImage && (
              <div style={{ width:72, height:96, borderRadius:12, overflow:'hidden', background:'#EEEDFE' }}>
                <img src={outfit.mannequinImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
              </div>
            )}
            {outfit.avatarImage && (
              <div style={{ width:48, height:96, borderRadius:12, background:'#F0EEFF',
                display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src={outfit.avatarImage} style={{ width:38, height:80, objectFit:'contain' }} alt=""/>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-center">
              <p style={{ fontSize:10, color:'#AFA9EC', marginBottom:2 }}>Outfit ID</p>
              <p style={{ fontSize:12, fontWeight:700, color:'#1a1560' }}>{outfit.id}</p>
            </div>
          </div>
        )}

        {/* Name */}
        <div className="mx-4 my-4 bg-white rounded-2xl px-4 py-3" style={{ border:CARD_BORDER }}>
          <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.06em', marginBottom:6 }}>Outfit Name</p>
          <input value={label} onChange={e => setLabel(e.target.value)}
            className="w-full outline-none"
            style={{ fontSize:15, fontWeight:600, color:'#1a1560', background:'transparent',
              fontFamily:"'DM Sans',sans-serif" }}/>
        </div>

        {/* Date */}
        <div className="mx-4 mb-4 bg-white rounded-2xl px-4 py-3" style={{ border:CARD_BORDER }}>
          <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.06em', marginBottom:6 }}>Date</p>
          <button onClick={() => setShowDateSheet(true)} className="flex items-center gap-2"
            style={{ color:'#1a1560', fontSize:14, fontWeight:600 }}>
            <Calendar size={14} color="#3D35A8"/> {formatDate(date)}
          </button>
        </div>

        {/* Style */}
        <div className="mx-4 mb-4 bg-white rounded-2xl p-4" style={{ border:CARD_BORDER }}>
          <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.06em', marginBottom:10 }}>Style</p>
          <div className="flex gap-2 flex-wrap">
            {STYLES_LIST.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background:style===s?'#3D35A8':'#F0EEFF', color:style===s?'white':'#7F77DD' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="mx-4 mb-4 bg-white rounded-2xl p-4" style={{ border:CARD_BORDER }}>
          <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.06em', marginBottom:10 }}>Items ({items.length})</p>
          <div className="flex gap-2 flex-wrap">
            {items.map((item, i) => (
              <div key={i} className="relative" style={{ flexShrink:0 }}>
                <div style={{ width:52, height:66, borderRadius:10, overflow:'hidden',
                  background:item.colorHex+'33', border:CARD_BORDER }}>
                  {item.image
                    ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:20 }}>{item.emoji}</div>}
                </div>
                <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background:'#EF4444', zIndex:1 }}>
                  <X size={9} color="white" strokeWidth={3}/>
                </button>
              </div>
            ))}
          </div>

          {/* Add from wardrobe */}
          {addableItems.length > 0 && (
            <>
              <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:600, marginTop:12, marginBottom:8 }}>
                Add from wardrobe:
              </p>
              <div className="flex gap-2 flex-wrap">
                {addableItems.slice(0, 10).map(w => (
                  <button key={w.id} onClick={() => setItems(prev => [...prev, w])}
                    className="relative"
                    style={{ width:40, height:50, borderRadius:8, overflow:'hidden',
                      background:w.colorHex+'33', border:'1.5px dashed #AFA9EC', flexShrink:0 }}>
                    {w.image
                      ? <img src={w.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                          justifyContent:'center', fontSize:14 }}>{w.emoji}</div>}
                    <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.55)',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Plus size={14} color="#3D35A8"/>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Save */}
        <div className="mx-4 mb-3">
          <button onClick={handleSave}
            className="w-full h-12 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background:'#3D35A8' }}>
            <Check size={16}/> Save Changes
          </button>
        </div>

        {/* Delete */}
        <div className="mx-4 mb-8">
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold"
            style={{ color:'#EF4444', background:'#FEF2F2', border:'1px solid #FECACA' }}>
            Delete Outfit
          </button>
        </div>
      </div>

      {showDateSheet && (
        <DatePickerSheet currentDate={date} onSelect={setDate} onClose={() => setShowDateSheet(false)}/>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center z-50 px-6"
          style={{ background:'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-3xl p-6 w-full" style={{ maxWidth:320 }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#1a1560', marginBottom:8 }}>
              Delete this outfit?
            </h3>
            <p style={{ fontSize:13, color:'#7F77DD', marginBottom:20 }}>
              This will remove it from Grid and Calendar. Closet items will not be deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-full font-semibold"
                style={{ background:'#F0EEFF', color:'#3D35A8', fontSize:14 }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-3 rounded-full font-semibold text-white"
                style={{ background:'#EF4444', fontSize:14 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CollectionCard — one collection on the list
═══════════════════════════════════════════════════════════════════ */
const PURPOSE_COLORS: Record<string,string> = {
  Travel:'#3B82F6', 'Work Week':'#8B5CF6', Formal:'#1A1A40',
  Casual:'#22C55E', Seasonal:'#F59E0B', Custom:'#AFA9EC',
};

function CollectionCard({ col, outfits, onTap }: {
  col: OutfitCollection; outfits: OutfitRecord[]; onTap: () => void;
}) {
  const linked    = outfits.filter(o => col.outfitIds.includes(o.id));
  const coverImg  = linked.find(o => o.mannequinImage)?.mannequinImage;
  const avatars   = linked.filter(o => o.avatarImage).slice(0, 4);
  const tagColor  = PURPOSE_COLORS[col.purpose] ?? '#AFA9EC';

  return (
    <div className="bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{ border:CARD_BORDER, boxShadow:'0 2px 12px rgba(61,53,168,0.07)' }} onClick={onTap}>
      {/* Cover */}
      <div style={{ height:120, background:'#EEEDFE', position:'relative', overflow:'hidden' }}>
        {coverImg
          ? <img src={coverImg} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Folders size={36} color="#C4BDFF" strokeWidth={1.5}/>
            </div>}
        <div style={{ position:'absolute', top:8, left:8 }}>
          <span style={{ fontSize:9, fontWeight:800, background:tagColor, color:'white',
            borderRadius:999, padding:'3px 9px' }}>{col.purpose}</span>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <p style={{ fontSize:14, fontWeight:700, color:'#1a1560', marginBottom:3 }}>{col.name}</p>
        <div className="flex items-center gap-2 mb-2.5">
          {col.dateFrom && (
            <span style={{ fontSize:10, color:'#AFA9EC' }}>
              {formatShort(col.dateFrom)}{col.dateTo ? ` – ${formatShort(col.dateTo)}` : ''}
            </span>
          )}
          <span style={{ fontSize:10, color:'#AFA9EC' }}>{linked.length} outfit{linked.length !== 1 ? 's' : ''}</span>
        </div>
        {/* Avatar row */}
        {avatars.length > 0 && (
          <div className="flex gap-1.5 items-center">
            {avatars.map((o, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-white"
                style={{ width:28, height:40, border:CARD_BORDER, flexShrink:0 }}>
                <img src={o.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
              </div>
            ))}
            {linked.length > 4 && (
              <div style={{ width:28, height:40, borderRadius:8, background:'#F0EEFF',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:9, fontWeight:700, color:'#3D35A8' }}>+{linked.length-4}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OutfitPickerRow — selectable row in Create/Edit Collection
═══════════════════════════════════════════════════════════════════ */
function OutfitPickerRow({ outfit, selected, onToggle }: {
  outfit: OutfitRecord; selected: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-2xl"
      style={{ background: selected ? '#EDE9FE' : 'white', border: selected ? '1.5px solid #3D35A8' : CARD_BORDER }}
      onClick={onToggle}>
      <div style={{ width:44, height:56, borderRadius:10, overflow:'hidden', background:'#EEEDFE', flexShrink:0 }}>
        {outfit.mannequinImage
          ? <img src={outfit.mannequinImage} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Camera size={16} color="#C4BDFF"/>
            </div>}
      </div>
      {outfit.avatarImage && (
        <div style={{ width:28, height:40, borderRadius:8, overflow:'hidden', flexShrink:0, background:'white', border:CARD_BORDER }}>
          <img src={outfit.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize:13, fontWeight:600, color:'#1a1560', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {outfit.label ?? 'Untitled Outfit'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span style={{ fontSize:9, fontWeight:700, background:'#F0EEFF', color:'#3D35A8', borderRadius:999, padding:'1px 6px' }}>
            {outfit.style}
          </span>
          <span style={{ fontSize:10, color:'#AFA9EC' }}>{formatDate(outfit.date)}</span>
        </div>
      </div>
      <div style={{
        width:22, height:22, borderRadius:'50%', flexShrink:0,
        background: selected ? '#3D35A8' : 'transparent',
        border: selected ? 'none' : '2px solid #DDD8FF',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {selected && <Check size={12} color="white" strokeWidth={3}/>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CreateCollectionView
═══════════════════════════════════════════════════════════════════ */
const PURPOSES = ['Travel','Work Week','Formal','Casual','Seasonal','Custom'] as const;

function CreateCollectionView({ allOutfits, onCancel, onSave }: {
  allOutfits: OutfitRecord[];
  onCancel: () => void;
  onSave: (col: Omit<OutfitCollection,'id'>) => void;
}) {
  const [colName,    setColName]    = useState('Untitled Collection');
  const [purpose,    setPurpose]    = useState('Travel');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggle(id: string) {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:PAGE_BG, ...DM }}>
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom:CARD_BORDER }}>
        <button onClick={onCancel} style={{ color:'#7F77DD', fontSize:14 }}>Cancel</button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:19, color:'#1a1560' }}>New Collection</h2>
        <div style={{ width:48 }}/>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-4">
        {/* Name */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Collection Name</p>
          <input value={colName} onChange={e => setColName(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 outline-none"
            style={{ background:'white', border:CARD_BORDER, fontSize:15, fontWeight:600, color:'#1a1560', ...DM }}/>
        </div>

        {/* Purpose */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Purpose</p>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(p => (
              <button key={p} onClick={() => setPurpose(p)}
                className="rounded-full px-3 py-1.5"
                style={{ background:purpose===p?'#3D35A8':'white', color:purpose===p?'white':'#7F77DD',
                  border:purpose===p?'none':CARD_BORDER, fontSize:12, fontWeight:600 }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Date Range (optional)</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <p style={{ fontSize:10, color:'#AFA9EC', marginBottom:4 }}>From</p>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 outline-none"
                style={{ background:'white', border:CARD_BORDER, fontSize:12, color:'#1a1560', ...DM }}/>
            </div>
            <div className="flex-1">
              <p style={{ fontSize:10, color:'#AFA9EC', marginBottom:4 }}>To</p>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 outline-none"
                style={{ background:'white', border:CARD_BORDER, fontSize:12, color:'#1a1560', ...DM }}/>
            </div>
          </div>
        </div>

        {/* Outfit selection */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
            Select Outfits ({selectedIds.length} selected)
          </p>
          {allOutfits.length === 0
            ? <p style={{ fontSize:13, color:'#AFA9EC', textAlign:'center', padding:'16px 0' }}>No outfits saved yet</p>
            : <div className="space-y-2">
                {allOutfits.map(o => (
                  <OutfitPickerRow key={o.id} outfit={o}
                    selected={selectedIds.includes(o.id)} onToggle={() => toggle(o.id)}/>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Save bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3"
        style={{ background:PAGE_BG, borderTop:CARD_BORDER }}>
        <button
          className="w-full h-12 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
          style={{ background:'#3D35A8' }}
          onClick={() => onSave({ name: colName || 'Untitled Collection', purpose, dateFrom:dateFrom||undefined, dateTo:dateTo||undefined, outfitIds:selectedIds })}>
          <Check size={15}/> Save Collection
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CollectionDetailView
═══════════════════════════════════════════════════════════════════ */
function CollectionDetailView({ col, allOutfits, onBack, onEdit, onOutfitTap }: {
  col: OutfitCollection; allOutfits: OutfitRecord[];
  onBack: () => void; onEdit: () => void; onOutfitTap: (o: OutfitRecord) => void;
}) {
  const linked   = allOutfits.filter(o => col.outfitIds.includes(o.id));
  const tagColor = PURPOSE_COLORS[col.purpose] ?? '#AFA9EC';

  return (
    <div className="h-full overflow-y-auto pb-10" style={{ background:PAGE_BG, ...DM }}>
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom:CARD_BORDER }}>
        <button onClick={onBack} className="flex items-center gap-1" style={{ color:'#7F77DD', fontSize:14 }}>
          <ChevronLeft size={18}/> Back
        </button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:19, color:'#1a1560' }}>Collection</h2>
        <button onClick={onEdit} style={{ color:'#3D35A8', fontSize:13, fontWeight:700 }}>Edit</button>
      </div>

      {/* Cover hero */}
      <div style={{ height:160, background:'#EEEDFE', overflow:'hidden', position:'relative' }}>
        {linked.find(o => o.mannequinImage)
          ? <img src={linked.find(o => o.mannequinImage)!.mannequinImage}
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Folders size={48} color="#C4BDFF" strokeWidth={1}/>
            </div>}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,21,96,0.55), transparent)' }}/>
        <div style={{ position:'absolute', bottom:16, left:16 }}>
          <p style={{ fontSize:22, fontWeight:800, color:'white', ...TITLE_FONT }}>{col.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize:9, fontWeight:800, background:tagColor, color:'white', borderRadius:999, padding:'2px 8px' }}>{col.purpose}</span>
            {col.dateFrom && (
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>
                {formatShort(col.dateFrom)}{col.dateTo ? ` – ${formatShort(col.dateTo)}` : ''}
              </span>
            )}
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>{linked.length} outfits</span>
          </div>
        </div>
      </div>

      {/* Outfit list */}
      <div className="p-4 space-y-3">
        {linked.length === 0
          ? <div className="flex flex-col items-center py-12 gap-2">
              <Folders size={32} color="#C4BDFF"/>
              <p style={{ fontSize:13, color:'#AFA9EC' }}>No outfits in this collection yet</p>
            </div>
          : linked.map(o => (
              <div key={o.id} className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                style={{ border:CARD_BORDER }} onClick={() => onOutfitTap(o)}>
                <div className="flex gap-3 p-3 items-center">
                  <div style={{ width:52, height:68, borderRadius:10, overflow:'hidden', background:'#EEEDFE', flexShrink:0 }}>
                    {o.mannequinImage
                      ? <img src={o.mannequinImage} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Camera size={16} color="#C4BDFF"/></div>}
                  </div>
                  {o.avatarImage && (
                    <div style={{ width:32, height:48, borderRadius:8, overflow:'hidden', flexShrink:0, border:CARD_BORDER }}>
                      <img src={o.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize:13, fontWeight:700, color:'#1a1560', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {o.label ?? 'Untitled Outfit'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span style={{ fontSize:9, fontWeight:700, background:'#F0EEFF', color:'#3D35A8', borderRadius:999, padding:'1px 6px' }}>{o.style}</span>
                      <span style={{ fontSize:10, color:'#AFA9EC' }}>{formatDate(o.date)}</span>
                    </div>
                    <p style={{ fontSize:10, color:'#AFA9EC', marginTop:2 }}>{o.outfitItems.length} items</p>
                  </div>
                  <ChevronLeft size={14} color="#AFA9EC" style={{ transform:'rotate(180deg)', flexShrink:0 }}/>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EditCollectionView
═══════════════════════════════════════════════════════════════════ */
function EditCollectionView({ col, allOutfits, onBack, onSaved, onDeleted }: {
  col: OutfitCollection; allOutfits: OutfitRecord[];
  onBack: () => void; onSaved: (updated: OutfitCollection) => void; onDeleted: () => void;
}) {
  const [colName,     setColName]    = useState(col.name);
  const [purpose,     setPurpose]    = useState(col.purpose);
  const [dateFrom,    setDateFrom]   = useState(col.dateFrom ?? '');
  const [dateTo,      setDateTo]     = useState(col.dateTo ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>([...col.outfitIds]);
  const [showDel,     setShowDel]    = useState(false);

  function toggle(id: string) {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative" style={{ background:PAGE_BG, ...DM }}>
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom:CARD_BORDER }}>
        <button onClick={onBack} className="flex items-center gap-1" style={{ color:'#7F77DD', fontSize:14 }}>
          <ChevronLeft size={18}/> Back
        </button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:19, color:'#1a1560' }}>Edit Collection</h2>
        <div style={{ width:48 }}/>
      </div>

      <div className="flex-1 overflow-y-auto pb-36 px-4 pt-4 space-y-4">
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Collection Name</p>
          <input value={colName} onChange={e => setColName(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 outline-none"
            style={{ background:'white', border:CARD_BORDER, fontSize:15, fontWeight:600, color:'#1a1560', ...DM }}/>
        </div>

        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Purpose</p>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(p => (
              <button key={p} onClick={() => setPurpose(p)}
                className="rounded-full px-3 py-1.5"
                style={{ background:purpose===p?'#3D35A8':'white', color:purpose===p?'white':'#7F77DD',
                  border:purpose===p?'none':CARD_BORDER, fontSize:12, fontWeight:600 }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Date Range (optional)</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <p style={{ fontSize:10, color:'#AFA9EC', marginBottom:4 }}>From</p>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 outline-none"
                style={{ background:'white', border:CARD_BORDER, fontSize:12, color:'#1a1560', ...DM }}/>
            </div>
            <div className="flex-1">
              <p style={{ fontSize:10, color:'#AFA9EC', marginBottom:4 }}>To</p>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 outline-none"
                style={{ background:'white', border:CARD_BORDER, fontSize:12, color:'#1a1560', ...DM }}/>
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
            Outfits ({selectedIds.length} selected)
          </p>
          <div className="space-y-2">
            {allOutfits.map(o => (
              <OutfitPickerRow key={o.id} outfit={o}
                selected={selectedIds.includes(o.id)} onToggle={() => toggle(o.id)}/>
            ))}
          </div>
        </div>

        <button onClick={() => setShowDel(true)}
          className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
          style={{ color:'#EF4444' }}>
          <Trash2 size={14}/> Delete Collection
        </button>
      </div>

      {/* Save bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3"
        style={{ background:PAGE_BG, borderTop:CARD_BORDER }}>
        <button
          className="w-full h-12 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
          style={{ background:'#3D35A8' }}
          onClick={() => onSaved({ ...col, name: colName||'Untitled Collection', purpose, dateFrom:dateFrom||undefined, dateTo:dateTo||undefined, outfitIds:selectedIds })}>
          <Check size={15}/> Save Changes
        </button>
      </div>

      {/* Delete confirmation */}
      {showDel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background:'rgba(26,21,96,0.4)' }}>
          <div className="bg-white rounded-3xl p-6 w-full" style={{ boxShadow:'0 8px 40px rgba(0,0,0,0.25)' }}>
            <p style={{ fontSize:17, fontWeight:800, color:'#1a1560', marginBottom:8 }}>Delete this collection?</p>
            <p style={{ fontSize:13, color:'#7F77DD', lineHeight:1.6, marginBottom:20 }}>
              This will only delete the collection. The outfits inside it will stay in Grid and Calendar.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDel(false)}
                className="flex-1 h-11 rounded-full font-semibold text-sm"
                style={{ background:'#F0EEFF', color:'#3D35A8' }}>Cancel</button>
              <button onClick={onDeleted}
                className="flex-1 h-11 rounded-full font-semibold text-sm text-white"
                style={{ background:'#EF4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AddToCollectionSheet — modal from Outfit Detail / Grid card
═══════════════════════════════════════════════════════════════════ */
function AddToCollectionSheet({ outfit, collections, onClose, onAdded, onCreateNew }: {
  outfit: OutfitRecord; collections: OutfitCollection[];
  onClose: () => void; onAdded: (colId: string) => void; onCreateNew: () => void;
}) {
  const [chosen, setChosen] = useState<string[]>(
    collections.filter(c => c.outfitIds.includes(outfit.id)).map(c => c.id)
  );

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background:'rgba(26,21,96,0.35)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl pb-8"
        style={{ boxShadow:'0 -8px 40px rgba(61,53,168,0.18)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width:36, height:4, borderRadius:99, background:'#EEEDFE' }}/>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <p style={{ fontSize:16, fontWeight:700, color:'#1a1560' }}>Add to Collection</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background:'#F0EEFF' }}><X size={14} color="#3D35A8"/></button>
        </div>
        <div className="px-4 space-y-2 mb-4 max-h-64 overflow-y-auto">
          {collections.map(c => {
            const inCol = c.outfitIds.includes(outfit.id);
            return (
              <div key={c.id}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
                style={{ background: inCol ? '#EDE9FE' : '#F8F7FF', border: inCol ? '1.5px solid #3D35A8' : CARD_BORDER }}
                onClick={() => { if (!inCol) { onAdded(c.id); } }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'#EEEDFE', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Folders size={16} color="#7F77DD"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize:13, fontWeight:600, color:'#1a1560' }}>{c.name}</p>
                  <p style={{ fontSize:10, color:'#AFA9EC' }}>{c.outfitIds.length} outfits · {c.purpose}</p>
                </div>
                {inCol && <Check size={14} color="#3D35A8" strokeWidth={3}/>}
              </div>
            );
          })}
        </div>
        <div className="px-4">
          <button onClick={onCreateNew}
            className="w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background:'#3D35A8', color:'white' }}>
            <Plus size={14}/> Create New Collection
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PlanCard — one plan on the list
═══════════════════════════════════════════════════════════════════ */
function PlanCard({ plan, allOutfits, onTap }: {
  plan: OutfitPlan; allOutfits: OutfitRecord[]; onTap: () => void;
}) {
  const plannedDays  = plan.planDaySlots.filter(s => s.outfitIds.length > 0).length;
  const totalDays    = plan.planDaySlots.length;
  const avatarOutfits = plan.planDaySlots
    .filter(s => s.outfitIds.length > 0)
    .slice(0, 4)
    .map(s => allOutfits.find(o => o.id === s.outfitIds[0]))
    .filter(Boolean) as OutfitRecord[];

  return (
    <div className="bg-white rounded-2xl cursor-pointer"
      style={{ border:CARD_BORDER, boxShadow:'0 2px 12px rgba(61,53,168,0.07)' }} onClick={onTap}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-3">
            <p style={{ fontSize:15, fontWeight:700, color:'#1a1560', marginBottom:4 }}>{plan.planName}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {plan.purpose && (
                <span style={{ fontSize:9, fontWeight:800, background:'#EDE9FE', color:'#3D35A8', borderRadius:999, padding:'2px 8px' }}>
                  {plan.purpose}
                </span>
              )}
              {plan.planningType === 'dateRange' && plan.dateFrom && plan.dateTo
                ? <span style={{ fontSize:10, color:'#AFA9EC' }}>{formatShort(plan.dateFrom)} – {formatShort(plan.dateTo)}</span>
                : <span style={{ fontSize:10, color:'#AFA9EC' }}>{plan.numberOfDays} days</span>}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p style={{ fontSize:14, fontWeight:800, color:'#3D35A8' }}>{plannedDays}<span style={{ fontSize:10, color:'#AFA9EC' }}> / {totalDays}</span></p>
            <p style={{ fontSize:9, color:'#AFA9EC' }}>days planned</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:4, background:'#F0EEFF', borderRadius:99, overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${totalDays > 0 ? (plannedDays/totalDays)*100 : 0}%`,
            background:'#3D35A8', borderRadius:99, transition:'width 0.3s' }}/>
        </div>

        {/* Avatar row */}
        {avatarOutfits.length > 0 && (
          <div className="flex gap-1.5 items-center">
            {avatarOutfits.map((o, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-white"
                style={{ width:28, height:40, border:CARD_BORDER, flexShrink:0 }}>
                {o.avatarImage
                  ? <img src={o.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                  : <PixelAvatarPreview outfitItems={o.outfitItems} size="small"/>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PlanDaySlotCard — one day slot inside plan views
═══════════════════════════════════════════════════════════════════ */
function PlanDaySlotCard({ slot, allOutfits, onChooseOutfit, onAIGenerate, onCreateNew, onRemoveOutfit, readOnly }: {
  slot: PlanDaySlot; allOutfits: OutfitRecord[];
  onChooseOutfit: () => void; onAIGenerate: () => void; onCreateNew: () => void;
  onRemoveOutfit: (outfitId: string) => void; readOnly?: boolean;
}) {
  const linkedOutfits = allOutfits.filter(o => slot.outfitIds.includes(o.id));
  const hasOutfits    = linkedOutfits.length > 0;
  const canAddMore    = slot.outfitIds.length < 3;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border:CARD_BORDER }}>
      {/* Slot header */}
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between"
        style={{ borderBottom:CARD_BORDER }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#1a1560' }}>{slot.dayLabel}</p>
        {slot.date && (
          <p style={{ fontSize:10, color:'#AFA9EC' }}>
            {new Date(slot.date + 'T12:00:00').toLocaleDateString('en-AU', { weekday:'short' })}
          </p>
        )}
      </div>

      {/* Empty state */}
      {!hasOutfits && (
        <div className="px-4 py-4">
          <p style={{ fontSize:11, color:'#AFA9EC', textAlign:'center', marginBottom:10 }}>No outfit planned</p>
          {!readOnly && (
            <div className="flex flex-col gap-2">
              <button onClick={onChooseOutfit}
                className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
                style={{ background:'#3D35A8', color:'white' }}>
                Choose Saved Outfit
              </button>
              <div className="flex gap-2">
                <button onClick={onAIGenerate}
                  className="flex-1 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1"
                  style={{ background:'#EDE9FE', color:'#3D35A8', border:CARD_BORDER }}>
                  <Sparkles size={11}/> AI Generate
                </button>
                <button onClick={onCreateNew}
                  className="flex-1 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1"
                  style={{ background:'white', color:'#7F77DD', border:CARD_BORDER }}>
                  <Plus size={11}/> Create New
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Outfit rows */}
      {hasOutfits && (
        <div>
          {linkedOutfits.map(o => (
            <div key={o.id} className="flex items-center gap-3 px-3 py-3"
              style={{ borderBottom:CARD_BORDER }}>
              <div style={{ width:44, height:56, borderRadius:10, overflow:'hidden', background:'#EEEDFE', flexShrink:0 }}>
                {o.mannequinImage
                  ? <img src={o.mannequinImage} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
                  : <PixelAvatarPreview outfitItems={o.outfitItems} size="medium"/>}
              </div>
              {o.avatarImage && (
                <div style={{ width:28, height:40, borderRadius:8, overflow:'hidden', flexShrink:0, border:CARD_BORDER }}>
                  <img src={o.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p style={{ fontSize:12, fontWeight:600, color:'#1a1560', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {o.label ?? 'Untitled Outfit'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span style={{ fontSize:9, fontWeight:700, background:'#F0EEFF', color:'#3D35A8', borderRadius:999, padding:'1px 5px' }}>{o.style}</span>
                  <span style={{ fontSize:9, color:'#AFA9EC' }}>{o.outfitItems.length} items</span>
                </div>
              </div>
              {!readOnly && (
                <button onClick={() => onRemoveOutfit(o.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background:'#FEF2F2' }}>
                  <X size={10} color="#EF4444" strokeWidth={3}/>
                </button>
              )}
            </div>
          ))}
          {!readOnly && canAddMore && (
            <div className="flex gap-2 px-3 py-2.5">
              <button onClick={onChooseOutfit}
                className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                style={{ background:'#3D35A8', color:'white' }}>
                <Plus size={10}/> Choose Saved
              </button>
              <button onClick={onAIGenerate}
                className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                style={{ background:'#EDE9FE', color:'#3D35A8', border:CARD_BORDER }}>
                <Sparkles size={10}/> AI
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OutfitPickerSheet — choose a saved outfit for a plan slot
═══════════════════════════════════════════════════════════════════ */
function OutfitPickerSheet({ allOutfits, onSelect, onClose }: {
  allOutfits: OutfitRecord[]; onSelect: (outfitId: string) => void; onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background:'rgba(26,21,96,0.35)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl flex flex-col"
        style={{ boxShadow:'0 -8px 40px rgba(61,53,168,0.18)', maxHeight:'70vh' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ width:36, height:4, borderRadius:99, background:'#EEEDFE' }}/>
        </div>
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <p style={{ fontSize:16, fontWeight:700, color:'#1a1560' }}>Choose Saved Outfit</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background:'#F0EEFF' }}><X size={14} color="#3D35A8"/></button>
        </div>
        <div className="px-4 space-y-2 overflow-y-auto pb-6">
          {allOutfits.length === 0
            ? <p style={{ fontSize:13, color:'#AFA9EC', textAlign:'center', padding:'16px 0' }}>No saved outfits yet</p>
            : allOutfits.map(o => (
                <div key={o.id} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
                  style={{ border:CARD_BORDER, background:'#F8F7FF' }}
                  onClick={() => { onSelect(o.id); onClose(); }}>
                  <div style={{ width:44, height:56, borderRadius:10, overflow:'hidden', background:'#EEEDFE', flexShrink:0 }}>
                    {o.mannequinImage
                      ? <img src={o.mannequinImage} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
                      : <Camera size={16} color="#C4BDFF"/>}
                  </div>
                  {o.avatarImage && (
                    <div style={{ width:28, height:40, borderRadius:8, overflow:'hidden', flexShrink:0, border:CARD_BORDER }}>
                      <img src={o.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize:13, fontWeight:600, color:'#1a1560', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {o.label ?? 'Untitled Outfit'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span style={{ fontSize:9, fontWeight:700, background:'#F0EEFF', color:'#3D35A8', borderRadius:999, padding:'1px 5px' }}>{o.style}</span>
                      <span style={{ fontSize:10, color:'#AFA9EC' }}>{formatDate(o.date)}</span>
                    </div>
                  </div>
                  <ChevronLeft size={14} color="#AFA9EC" style={{ transform:'rotate(180deg)', flexShrink:0 }}/>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AIGenerateSheet — simulated AI outfit suggestion
═══════════════════════════════════════════════════════════════════ */
function AIGenerateSheet({ allOutfits, onUse, onClose }: {
  allOutfits: OutfitRecord[]; onUse: (outfitId: string) => void; onClose: () => void;
}) {
  const [seed, setSeed] = useState(0);
  const demo = allOutfits[seed % Math.max(allOutfits.length, 1)];
  if (!demo) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background:'rgba(26,21,96,0.35)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl pb-6"
        style={{ boxShadow:'0 -8px 40px rgba(61,53,168,0.18)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width:36, height:4, borderRadius:99, background:'#EEEDFE' }}/>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} style={{ color:'#7F77DD', fontSize:13 }}>Cancel</button>
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} color="#3D35A8"/>
            <p style={{ fontSize:15, fontWeight:700, color:'#1a1560' }}>AI Generated</p>
          </div>
          <div style={{ width:48 }}/>
        </div>

        {/* Preview */}
        <div className="flex gap-4 px-5 pb-4 items-start">
          <div className="flex-1 rounded-2xl overflow-hidden" style={{ maxWidth:160, background:'#EEEDFE', border:CARD_BORDER }}>
            {demo.mannequinImage
              ? <img src={demo.mannequinImage}
                  style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', objectPosition:'top', display:'block' }} alt=""/>
              : <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={32} color="#C4BDFF"/>
                </div>}
          </div>
          <div className="flex flex-col items-center gap-2 pt-2">
            {demo.avatarImage && (
              <div className="rounded-2xl overflow-hidden" style={{ border:CARD_BORDER, padding:6, background:'white' }}>
                <img src={demo.avatarImage} style={{ width:52, height:80, objectFit:'contain' }} alt=""/>
              </div>
            )}
            <p style={{ fontSize:9, color:'#AFA9EC', textAlign:'center', lineHeight:1.4 }}>AI suggested</p>
          </div>
        </div>

        {/* Outfit pieces */}
        <div className="mx-5 rounded-2xl p-3 mb-4" style={{ background:'#F8F7FF', border:CARD_BORDER }}>
          <p style={{ fontSize:10, fontWeight:700, color:'#AFA9EC', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Outfit Pieces</p>
          <div className="flex gap-2 flex-wrap">
            {demo.outfitItems.map((item, i) => (
              <div key={i} style={{ width:40, height:50, borderRadius:8, overflow:'hidden',
                background:item.colorHex+'33', border:CARD_BORDER, flexShrink:0 }}>
                {item.image
                  ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{item.emoji}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5">
          <button onClick={() => setSeed(s => s + 1)}
            className="flex-1 h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5"
            style={{ background:'white', border:CARD_BORDER, color:'#3D35A8' }}>
            Regenerate
          </button>
          <button onClick={() => { onUse(demo.id); onClose(); }}
            className="flex-1 h-12 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-1.5"
            style={{ background:'#3D35A8' }}>
            <Check size={14}/> Use This Outfit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CreatePlanView — create or edit an outfit plan
═══════════════════════════════════════════════════════════════════ */
function CreatePlanView({ allOutfits, initialPlan, onCancel, onSave, onDelete, onCreateNewForSlot }: {
  allOutfits: OutfitRecord[];
  initialPlan?: OutfitPlan;
  onCancel: () => void;
  onSave: (plan: Omit<OutfitPlan,'id'>) => void;
  onDelete?: () => void;
  onCreateNewForSlot?: (slotIdx: number, draft: Omit<OutfitPlan,'id'>, slotDate?: string) => void;
}) {
  const [planName,      setPlanName]      = useState(initialPlan?.planName ?? 'Untitled Plan');
  const [planningType,  setPlanningType]  = useState<'dateRange'|'numberOfDays'>(initialPlan?.planningType ?? 'numberOfDays');
  const [dateFrom,      setDateFrom]      = useState(initialPlan?.dateFrom ?? '');
  const [dateTo,        setDateTo]        = useState(initialPlan?.dateTo ?? '');
  const [numDays,       setNumDays]       = useState(initialPlan?.numberOfDays ?? 3);
  const [slots,         setSlots]         = useState<PlanDaySlot[]>(() =>
    initialPlan?.planDaySlots?.length
      ? initialPlan.planDaySlots
      : [{ dayLabel:'Day 1', outfitIds:[] },{ dayLabel:'Day 2', outfitIds:[] },{ dayLabel:'Day 3', outfitIds:[] }]
  );
  const [pickerSlot,    setPickerSlot]    = useState<number|null>(null);
  const [aiSlot,        setAiSlot]        = useState<number|null>(null);
  const [showDel,       setShowDel]       = useState(false);

  function regenerateDateSlots(from: string, to: string) {
    if (!from || !to || to < from) { setSlots([]); return; }
    const fromD = new Date(from + 'T12:00:00'), toD = new Date(to + 'T12:00:00');
    const newSlots: PlanDaySlot[] = [];
    const cur = new Date(fromD);
    while (cur <= toD) {
      const ds  = cur.toISOString().split('T')[0];
      const lbl = cur.toLocaleDateString('en-AU', { day:'numeric', month:'short' });
      const ex  = slots.find(s => s.date === ds);
      newSlots.push({ dayLabel:lbl, date:ds, outfitIds: ex?.outfitIds ?? [] });
      cur.setDate(cur.getDate() + 1);
    }
    setSlots(newSlots);
  }

  function handleDateFrom(d: string) { setDateFrom(d); regenerateDateSlots(d, dateTo); }
  function handleDateTo(d: string)   { setDateTo(d);   regenerateDateSlots(dateFrom, d); }

  function handleNumDays(n: number) {
    const next = Math.max(1, Math.min(14, n));
    setNumDays(next);
    if (next > slots.length) {
      setSlots(prev => [...prev, ...Array.from({ length:next-prev.length }, (_, i) => ({ dayLabel:`Day ${prev.length+i+1}`, outfitIds:[] }))]);
    } else {
      setSlots(prev => prev.slice(0, next).map((s,i) => ({ ...s, dayLabel:`Day ${i+1}` })));
    }
  }

  function handlePlanningType(t: 'dateRange'|'numberOfDays') {
    setPlanningType(t);
    if (t === 'numberOfDays') {
      setSlots(Array.from({ length:numDays }, (_, i) => ({ dayLabel:`Day ${i+1}`, outfitIds: slots[i]?.outfitIds ?? [] })));
    } else {
      regenerateDateSlots(dateFrom, dateTo);
    }
  }

  function addOutfitToSlot(idx: number, outfitId: string) {
    setSlots(prev => prev.map((s, i) =>
      i === idx && s.outfitIds.length < 3 && !s.outfitIds.includes(outfitId)
        ? { ...s, outfitIds: [...s.outfitIds, outfitId] } : s
    ));
  }

  function removeOutfitFromSlot(idx: number, outfitId: string) {
    setSlots(prev => prev.map((s, i) =>
      i === idx ? { ...s, outfitIds: s.outfitIds.filter(id => id !== outfitId) } : s
    ));
  }

  const plannedCount = slots.filter(s => s.outfitIds.length > 0).length;
  const isEditing    = !!initialPlan;

  return (
    <div className="h-full flex flex-col overflow-hidden relative" style={{ background:PAGE_BG, ...DM }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom:CARD_BORDER }}>
        <button onClick={onCancel} style={{ color:'#7F77DD', fontSize:14 }}>Cancel</button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:19, color:'#1a1560' }}>
          {isEditing ? 'Edit Plan' : 'New Outfit Plan'}
        </h2>
        <div style={{ width:48 }}/>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-4 space-y-4">
        {/* Plan Name */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Plan Name</p>
          <input value={planName} onChange={e => setPlanName(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 outline-none"
            style={{ background:'white', border:CARD_BORDER, fontSize:15, fontWeight:600, color:'#1a1560', ...DM }}/>
        </div>

        {/* Planning Type */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Planning Type</p>
          <div className="flex gap-2 rounded-2xl p-1" style={{ background:'#F0EEFF' }}>
            {(['dateRange','numberOfDays'] as const).map(t => (
              <button key={t} onClick={() => handlePlanningType(t)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background:planningType===t?'#3D35A8':'transparent', color:planningType===t?'white':'#7F77DD' }}>
                {t === 'dateRange' ? 'Date Range' : 'Number of Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        {planningType === 'dateRange' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:600, marginBottom:4 }}>From</p>
              <input type="date" value={dateFrom} onChange={e => handleDateFrom(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 outline-none"
                style={{ background:'white', border:CARD_BORDER, fontSize:12, color:'#1a1560', ...DM }}/>
            </div>
            <div className="flex-1">
              <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:600, marginBottom:4 }}>To</p>
              <input type="date" value={dateTo} onChange={e => handleDateTo(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 outline-none"
                style={{ background:'white', border:CARD_BORDER, fontSize:12, color:'#1a1560', ...DM }}/>
            </div>
          </div>
        )}

        {/* Number of Days stepper */}
        {planningType === 'numberOfDays' && (
          <div>
            <p style={{ fontSize:10, color:'#AFA9EC', fontWeight:600, marginBottom:8 }}>Number of Days</p>
            <div className="flex items-center gap-4">
              <button onClick={() => handleNumDays(numDays - 1)}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background:'white', border:CARD_BORDER }}>
                <Minus size={16} color="#3D35A8"/>
              </button>
              <span style={{ fontSize:26, fontWeight:800, color:'#1a1560', minWidth:40, textAlign:'center' }}>{numDays}</span>
              <button onClick={() => handleNumDays(numDays + 1)}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background:'white', border:CARD_BORDER }}>
                <Plus size={16} color="#3D35A8"/>
              </button>
              <span style={{ fontSize:13, color:'#AFA9EC' }}>days</span>
            </div>
          </div>
        )}

        {/* Plan Days */}
        {slots.length > 0 && (
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
              Plan Days — {plannedCount} / {slots.length} planned
            </p>
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <PlanDaySlotCard key={i} slot={slot} allOutfits={allOutfits}
                  onChooseOutfit={() => setPickerSlot(i)}
                  onAIGenerate={() => setAiSlot(i)}
                  onCreateNew={() => {
                    if (onCreateNewForSlot) {
                      onCreateNewForSlot(i, {
                        planName: planName || 'Untitled Plan',
                        planningType,
                        purpose: undefined,
                        dateFrom: planningType === 'dateRange' ? dateFrom || undefined : undefined,
                        dateTo:   planningType === 'dateRange' ? dateTo || undefined : undefined,
                        numberOfDays: planningType === 'numberOfDays' ? numDays : undefined,
                        planDaySlots: slots,
                      }, slot.date);
                    } else {
                      setPickerSlot(i);
                    }
                  }}
                  onRemoveOutfit={id => removeOutfitFromSlot(i, id)}
                />
              ))}
            </div>
          </div>
        )}

        {isEditing && onDelete && (
          <button onClick={() => setShowDel(true)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ color:'#EF4444', background:'#FEF2F2', border:'1px solid #FECACA' }}>
            <Trash2 size={14}/> Delete Outfit Plan
          </button>
        )}
      </div>

      {/* Save bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3"
        style={{ background:PAGE_BG, borderTop:CARD_BORDER }}>
        <button
          className="w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background:'#1A1A40', color:'white' }}
          onClick={() => onSave({
            planName: planName || 'Untitled Plan',
            planningType,
            purpose: undefined,
            dateFrom: planningType === 'dateRange' ? dateFrom || undefined : undefined,
            dateTo:   planningType === 'dateRange' ? dateTo || undefined : undefined,
            numberOfDays: planningType === 'numberOfDays' ? numDays : undefined,
            planDaySlots: slots,
          })}>
          <Check size={15}/> Save Outfit Plan
        </button>
      </div>

      {/* Sheets */}
      {pickerSlot !== null && (
        <OutfitPickerSheet allOutfits={allOutfits}
          onSelect={id => addOutfitToSlot(pickerSlot, id)}
          onClose={() => setPickerSlot(null)}/>
      )}
      {aiSlot !== null && (
        <AIGenerateSheet allOutfits={allOutfits}
          onUse={id => addOutfitToSlot(aiSlot, id)}
          onClose={() => setAiSlot(null)}/>
      )}

      {/* Delete confirm */}
      {showDel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background:'rgba(26,21,96,0.4)' }}>
          <div className="bg-white rounded-3xl p-6 w-full" style={{ boxShadow:'0 8px 40px rgba(0,0,0,0.25)' }}>
            <p style={{ fontSize:17, fontWeight:800, color:'#1a1560', marginBottom:8 }}>Delete this plan?</p>
            <p style={{ fontSize:13, color:'#7F77DD', lineHeight:1.6, marginBottom:20 }}>
              This will only delete the plan. Outfit Records will stay in Grid and Calendar.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDel(false)}
                className="flex-1 h-11 rounded-full font-semibold text-sm"
                style={{ background:'#F0EEFF', color:'#3D35A8' }}>Cancel</button>
              <button onClick={onDelete}
                className="flex-1 h-11 rounded-full font-semibold text-sm text-white"
                style={{ background:'#EF4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PlanDetailView — read plan + edit outfit assignments per slot
═══════════════════════════════════════════════════════════════════ */
function PlanDetailView({ plan, allOutfits, onBack, onEdit, onSlotUpdate, onCreateNewForSlot }: {
  plan: OutfitPlan; allOutfits: OutfitRecord[];
  onBack: () => void; onEdit: () => void;
  onSlotUpdate: (updatedPlan: OutfitPlan) => void;
  onCreateNewForSlot?: (slotIdx: number, slotDate?: string) => void;
}) {
  const [slots,      setSlots]      = useState<PlanDaySlot[]>(plan.planDaySlots);
  const [pickerSlot, setPickerSlot] = useState<number|null>(null);
  const [aiSlot,     setAiSlot]     = useState<number|null>(null);

  function addOutfitToSlot(idx: number, outfitId: string) {
    const next = slots.map((s, i) =>
      i === idx && s.outfitIds.length < 3 && !s.outfitIds.includes(outfitId)
        ? { ...s, outfitIds:[...s.outfitIds, outfitId] } : s
    );
    setSlots(next);
    onSlotUpdate({ ...plan, planDaySlots: next });
  }

  function removeOutfitFromSlot(idx: number, outfitId: string) {
    const next = slots.map((s, i) =>
      i === idx ? { ...s, outfitIds: s.outfitIds.filter(id => id !== outfitId) } : s
    );
    setSlots(next);
    onSlotUpdate({ ...plan, planDaySlots: next });
  }

  const plannedCount = slots.filter(s => s.outfitIds.length > 0).length;

  return (
    <div className="h-full overflow-y-auto pb-10 relative" style={{ background:PAGE_BG, ...DM }}>
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom:CARD_BORDER }}>
        <button onClick={onBack} className="flex items-center gap-1" style={{ color:'#7F77DD', fontSize:14 }}>
          <ChevronLeft size={18}/> Back
        </button>
        <h2 style={{ ...TITLE_FONT, fontWeight:800, fontSize:19, color:'#1a1560' }}>Plan</h2>
        <button onClick={onEdit} style={{ color:'#3D35A8', fontSize:13, fontWeight:700 }}>Edit</button>
      </div>

      {/* Plan info hero */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom:CARD_BORDER }}>
        <p style={{ fontSize:22, fontWeight:800, color:'#1a1560', ...TITLE_FONT, marginBottom:6 }}>{plan.planName}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {plan.purpose && (
            <span style={{ fontSize:9, fontWeight:800, background:'#EDE9FE', color:'#3D35A8', borderRadius:999, padding:'3px 10px' }}>
              {plan.purpose}
            </span>
          )}
          {plan.planningType === 'dateRange' && plan.dateFrom && plan.dateTo
            ? <span style={{ fontSize:12, color:'#AFA9EC' }}>{formatShort(plan.dateFrom)} – {formatShort(plan.dateTo)}</span>
            : <span style={{ fontSize:12, color:'#AFA9EC' }}>{plan.numberOfDays} days</span>}
          <span style={{ fontSize:12, color:'#3D35A8', fontWeight:600 }}>{plannedCount} / {slots.length} planned</span>
        </div>
        {/* Progress bar */}
        <div style={{ height:4, background:'#F0EEFF', borderRadius:99, overflow:'hidden', marginTop:10 }}>
          <div style={{ height:'100%', width:`${slots.length > 0 ? (plannedCount/slots.length)*100 : 0}%`,
            background:'#3D35A8', borderRadius:99 }}/>
        </div>
      </div>

      {/* Slot cards */}
      <div className="px-4 pt-4 space-y-3 pb-6">
        {slots.map((slot, i) => (
          <PlanDaySlotCard key={i} slot={slot} allOutfits={allOutfits}
            onChooseOutfit={() => setPickerSlot(i)}
            onAIGenerate={() => setAiSlot(i)}
            onCreateNew={() => onCreateNewForSlot ? onCreateNewForSlot(i, slot.date) : setPickerSlot(i)}
            onRemoveOutfit={id => removeOutfitFromSlot(i, id)}
          />
        ))}
      </div>

      {pickerSlot !== null && (
        <OutfitPickerSheet allOutfits={allOutfits}
          onSelect={id => addOutfitToSlot(pickerSlot, id)}
          onClose={() => setPickerSlot(null)}/>
      )}
      {aiSlot !== null && (
        <AIGenerateSheet allOutfits={allOutfits}
          onUse={id => addOutfitToSlot(aiSlot, id)}
          onClose={() => setAiSlot(null)}/>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main OutfitTab
═══════════════════════════════════════════════════════════════════ */
type TabView = 'records' | 'create' | 'detail' | 'edit';

export default function OutfitTab() {
  const [view,               setView]               = useState<TabView>('records');
  const [viewMode,           setViewMode]           = useState<'grid'|'calendar'|'plan'>('grid');
  const [filterStyle,        setFilterStyle]        = useState('All');
  const [savedOutfits,       setSavedOutfits]       = useState<OutfitRecord[]>(getOutfits());
  const [collections,        setCollections]        = useState<OutfitCollection[]>(getCollections());
  const [plans,              setPlans]              = useState<OutfitPlan[]>(getPlans());
  const [calMonth,           setCalMonth]           = useState(4);
  const [calDay,             setCalDay]             = useState(14);
  const [selectedOutfit,     setSelectedOutfit]     = useState<OutfitRecord|null>(null);
  const [selectedCollection, setSelectedCollection] = useState<OutfitCollection|null>(null);
  const [collectionSubView,  setCollectionSubView]  = useState<'list'|'detail'|'create'|'edit'>('list');
  const [selectedPlan,       setSelectedPlan]       = useState<OutfitPlan|null>(null);
  const [planSubView,        setPlanSubView]        = useState<'list'|'detail'|'create'|'edit'>('list');
  const [planDraft,          setPlanDraft]          = useState<Omit<OutfitPlan,'id'>|null>(null);
  const [planDraftKey,       setPlanDraftKey]       = useState(0);
  const [pendingSlotAssign,  setPendingSlotAssign]  = useState<{slotIdx:number; source:'planCreate'|'planDetail'; slotDate?:string}|null>(null);
  const [createFromDate,     setCreateFromDate]     = useState<string|undefined>();
  const [peekedItem,         setPeekedItem]         = useState<SavedOutfitItem|null>(null);
  const [addToColOutfit,     setAddToColOutfit]     = useState<OutfitRecord|null>(null);
  const [wardrobeItems,      setWardrobeItems]      = useState<WardrobeItem[]>(() =>
    getItems().map(i => ({ id:i.id, type:i.type, emoji:i.emoji, color:i.color,
      colorHex:i.colorHex, image:i.image, name:i.name }))
  );

  useEffect(() => subscribeOutfits(() => setSavedOutfits(getOutfits())), []);
  useEffect(() => subscribeCollections(() => setCollections(getCollections())), []);
  useEffect(() => subscribePlans(() => setPlans(getPlans())), []);
  useEffect(() => subscribeWardrobe(() =>
    setWardrobeItems(getItems().map(i => ({ id:i.id, type:i.type, emoji:i.emoji, color:i.color,
      colorHex:i.colorHex, image:i.image, name:i.name })))
  ), []);

  function openCreate(fromDate?: string) { setCreateFromDate(fromDate); setView('create'); }
  function openDetail(outfit: OutfitRecord) { setSelectedOutfit(outfit); setView('detail'); }
  function openEdit(outfit: OutfitRecord)   { setSelectedOutfit(outfit); setView('edit'); }

  function openCollectionDetail(col: OutfitCollection) { setSelectedCollection(col); setCollectionSubView('detail'); }
  function openCollectionEdit(col: OutfitCollection)   { setSelectedCollection(col); setCollectionSubView('edit'); }

  function handleSaveCollection(data: Omit<OutfitCollection,'id'>) {
    addCollection({ id:`COL${Date.now()}`, ...data });
    setCollectionSubView('list');
    toast.success('Collection saved');
  }
  function handleUpdateCollection(updated: OutfitCollection) {
    updateCollection(updated);
    setSelectedCollection(updated);
    setCollectionSubView('detail');
    toast.success('Collection updated');
  }
  function handleDeleteCollection() {
    if (selectedCollection) { deleteCollection(selectedCollection.id); }
    setSelectedCollection(null);
    setCollectionSubView('list');
    toast.success('Collection deleted');
  }
  function handleAddToCollection(colId: string) {
    if (addToColOutfit) { addOutfitToCollection(colId, addToColOutfit.id); }
    setAddToColOutfit(null);
    toast.success('Added to collection');
  }

  function handleSavePlan(data: Omit<OutfitPlan,'id'>) {
    addPlan({ id:`PLN${Date.now()}`, ...data });
    setPlanSubView('list');
    toast.success('Outfit plan saved');
  }
  function handleUpdatePlan(updated: OutfitPlan) {
    updatePlan(updated);
    setSelectedPlan(updated);
    setPlanSubView('detail');
    toast.success('Plan updated');
  }
  function handleDeletePlan() {
    if (selectedPlan) deletePlan(selectedPlan.id);
    setSelectedPlan(null);
    setPlanSubView('list');
    toast.success('Plan deleted');
  }
  function handlePlanSlotUpdate(updated: OutfitPlan) {
    updatePlan(updated);
    setSelectedPlan(updated);
  }
  function handleCreateNewFromPlanCreate(slotIdx: number, draft: Omit<OutfitPlan,'id'>, slotDate?: string) {
    setPlanDraft(draft);
    setPendingSlotAssign({ slotIdx, source:'planCreate', slotDate });
    setCreateFromDate(slotDate);
    setView('create');
  }
  function handleCreateNewFromPlanDetail(slotIdx: number, slotDate?: string) {
    setPendingSlotAssign({ slotIdx, source:'planDetail', slotDate });
    setCreateFromDate(slotDate);
    setView('create');
  }

  function handleSaveOutfit(items: CanvasItem[], date: string, style: string, name: string, mannequinImage?: string, avatarImage?: string, addToCalendar?: boolean) {
    const newId = `O${Date.now()}`;
    addOutfit({ id:newId, date, style, label: name || 'Untitled Outfit',
      mannequinImage, avatarImage,
      showInGrid: !addToCalendar,
      showInCalendar: addToCalendar === true,
      outfitItems: items.map(c => c.item) });

    if (pendingSlotAssign) {
      const { slotIdx, source } = pendingSlotAssign;
      if (source === 'planDetail' && selectedPlan) {
        const updatedSlots = selectedPlan.planDaySlots.map((s, i) =>
          i === slotIdx && s.outfitIds.length < 3 && !s.outfitIds.includes(newId)
            ? { ...s, outfitIds:[...s.outfitIds, newId] } : s
        );
        const updated = { ...selectedPlan, planDaySlots: updatedSlots };
        updatePlan(updated);
        setSelectedPlan(updated);
        setPendingSlotAssign(null);
        setCreateFromDate(undefined);
        setView('records');
        setPlanSubView('detail');
        toast.success('Outfit created and added to plan day');
      } else if (source === 'planCreate' && planDraft) {
        const updatedSlots = planDraft.planDaySlots.map((s, i) =>
          i === slotIdx && s.outfitIds.length < 3 && !s.outfitIds.includes(newId)
            ? { ...s, outfitIds:[...s.outfitIds, newId] } : s
        );
        const restoredDraft = { ...planDraft, planDaySlots: updatedSlots };
        setPlanDraft(restoredDraft);
        setPlanDraftKey(k => k + 1);
        setPendingSlotAssign(null);
        setCreateFromDate(undefined);
        setView('records');
        setPlanSubView('create');
        toast.success('Outfit created and added to plan day');
      }
    } else {
      setCreateFromDate(undefined);
      setView('records');
      toast.success('Outfit saved');
    }
  }
  function handleEditSaved(updated: OutfitRecord) {
    setSelectedOutfit(updated);
    setView('detail');
    toast.success('Outfit updated');
  }
  function handleDeleted() {
    setSelectedOutfit(null);
    setView('records');
    toast.success('Outfit deleted');
  }

  /* ── Sub-views ─────────────────────────────────────────────────── */
  if (view === 'create') return (
    <div className="h-full relative">
      <CreateOutfitView
        onCancel={() => {
          setCreateFromDate(undefined);
          if (pendingSlotAssign) {
            setPendingSlotAssign(null);
            setView('records');
          } else {
            setView('records');
          }
        }}
        onSave={handleSaveOutfit}
        wardrobe={wardrobeItems}
        initialDate={createFromDate}
      />
    </div>
  );

  if (view === 'detail' && selectedOutfit) return (
    <div className="h-full relative">
      <OutfitDetailView
        outfit={selectedOutfit}
        onBack={() => { setView('records'); }}
        onEdit={() => openEdit(selectedOutfit)}
        onWearToday={() => {
          const todayDate = getTodayDate();
          const alreadyAdded = savedOutfits.some(o =>
            o.date === todayDate &&
            o.showInCalendar === true &&
            o.outfitItems.length === selectedOutfit.outfitItems.length &&
            o.outfitItems.every((item, i) => item.id === selectedOutfit.outfitItems[i]?.id)
          );

          if (alreadyAdded) {
            toast.info("Already added to today's calendar");
            return;
          }

          addOutfit({
            id: `O${Date.now()}`,
            date: todayDate,
            style: selectedOutfit.style,
            label: selectedOutfit.label,
            mannequinImage: selectedOutfit.mannequinImage,
            avatarImage: selectedOutfit.avatarImage,
            showInGrid: false,
            showInCalendar: true,
            outfitItems: selectedOutfit.outfitItems,
          });
          toast.success("Outfit added to today's calendar");
        }}
      />
      {addToColOutfit && (
        <AddToCollectionSheet
          outfit={addToColOutfit} collections={collections}
          onClose={() => setAddToColOutfit(null)}
          onAdded={handleAddToCollection}
          onCreateNew={() => { setAddToColOutfit(null); setCollectionSubView('create'); setView('records'); }}
        />
      )}
    </div>
  );

  if (view === 'edit' && selectedOutfit) return (
    <div className="h-full relative">
      <EditOutfitView
        outfit={selectedOutfit}
        wardrobe={wardrobeItems}
        onBack={() => setView('detail')}
        onSaved={handleEditSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );

  /* ── Records view ──────────────────────────────────────────────── */
  const filtered       = savedOutfits.filter(o => o.showInGrid === true && (filterStyle==='All' || o.style===filterStyle));
  const MONTH_NAMES    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const firstDayOfMon  = new Date(CAL_YEAR, calMonth, 1).getDay();
  const daysInMonth    = new Date(CAL_YEAR, calMonth + 1, 0).getDate();
  const todayCalDay    = calMonth === 4 ? 14 : -1;

  function getDayOutfits(day: number): OutfitRecord[] {
    const ds = `${CAL_YEAR}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    // Existing: outfits with showInCalendar === true on this date
    const fromStore = savedOutfits.filter(o =>
      o.date === ds && o.showInCalendar === true
    );

    // Always include preset outfits on their assigned demo dates
    const PRESET_DEMO_DATES = ['2026-05-02', '2026-05-06', '2026-05-09'];
    if (PRESET_DEMO_DATES.includes(ds)) {
      const preset = savedOutfits.find(o =>
        (o.id === 'O001' || o.id === 'O002' || o.id === 'O003') && o.date === ds
      );
      if (preset && !fromStore.find(x => x.id === preset.id)) {
        return [...fromStore, preset];
      }
    }

    return fromStore;
  }

  const calSelectedDate    = `${CAL_YEAR}-${String(calMonth+1).padStart(2,'0')}-${String(calDay).padStart(2,'0')}`;
  const selectedDayOutfits = getDayOutfits(calDay);

  return (
    <div className="h-full relative overflow-hidden" style={{ isolation:'isolate' }}>
      <div className="h-full overflow-y-auto pb-20" style={{ background:PAGE_BG, ...DM }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 sticky top-0 z-10"
          style={{ background:PAGE_BG, borderBottom:CARD_BORDER }}>
          <h1 style={{ ...TITLE_FONT, fontWeight:800, fontSize:30, color:'#1a1560',
            lineHeight:1.1, marginBottom:10 }}>Outfit Records</h1>
          <div className="flex gap-1.5">
            {(['grid','calendar'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background:viewMode===m?'#3D35A8':'white',
                  color:viewMode===m?'white':'#7F77DD',
                  border:viewMode===m?'none':CARD_BORDER }}>
                {m==='calendar'
                  ? <><Calendar size={11} className="inline mr-1"/>Cal</>
                  : 'Grid'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid view ── */}
        {viewMode === 'grid' && (
          <div className="p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
              {STYLE_FILTERS.map(s => (
                <button key={s} onClick={() => setFilterStyle(s)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ background:filterStyle===s?'#3D35A8':'white',
                    color:filterStyle===s?'white':'#7F77DD',
                    border:filterStyle===s?'none':CARD_BORDER }}>
                  {s}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor:'#AFA9EC' }}>
                  <Plus size={24} color="#AFA9EC"/>
                </div>
                <p style={{ fontSize:14, fontWeight:600, color:'#AFA9EC' }}>No outfits yet</p>
                <p style={{ fontSize:12, color:'#AFA9EC' }}>Tap + to create your first look</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(outfit => (
                  <OutfitRecordCard key={outfit.id} outfit={outfit}
                    onTap={() => openDetail(outfit)}
                    onEdit={() => openEdit(outfit)}
                    onItemTap={item => setPeekedItem(item)}
                    onAddToCollection={() => setAddToColOutfit(outfit)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Calendar view ── */}
        {viewMode === 'calendar' && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-4" style={{ border:CARD_BORDER }}>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => { setCalMonth(m => (m-1+12)%12); setCalDay(1); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:'#F0EEFF' }}>
                  <ChevronLeft size={14} color="#3D35A8"/>
                </button>
                <p style={{ fontWeight:700, color:'#1a1560', fontSize:15 }}>
                  {MONTH_NAMES[calMonth]} {CAL_YEAR}
                </p>
                <button onClick={() => { setCalMonth(m => (m+1)%12); setCalDay(1); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:'#F0EEFF' }}>
                  <ChevronRight size={14} color="#3D35A8"/>
                </button>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} className="text-center py-1"
                    style={{ fontSize:10, fontWeight:600, color:'#AFA9EC' }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length:42 }, (_, i) => {
                  const dayNum  = i - firstDayOfMon + 1;
                  const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                  const isToday = isValid && dayNum === todayCalDay;
                  const isSel   = isValid && dayNum === calDay;
                  const outfits = isValid ? getDayOutfits(dayNum) : [];
                  return (
                    <OutfitCalendarCell key={i}
                      dayNum={dayNum} isValid={isValid} isToday={isToday}
                      isSelected={isSel} dayOutfits={outfits}
                      onClick={() => setCalDay(dayNum)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Selected day section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1a1560' }}>
                    Outfits for {formatShort(calSelectedDate)}
                  </p>
                  <p style={{ fontSize:12, color:'#AFA9EC', marginTop:1 }}>
                    {selectedDayOutfits.length} / 3
                  </p>
                </div>
              </div>

              {selectedDayOutfits.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3"
                  style={{ border:CARD_BORDER }}>
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor:'#AFA9EC' }}>
                    <Plus size={20} color="#AFA9EC"/>
                  </div>
                  <p style={{ fontSize:12, color:'#AFA9EC' }}>No outfit on this day</p>
                  <button onClick={() => openCreate(calSelectedDate)}
                    className="h-9 px-5 rounded-full text-sm font-semibold text-white"
                    style={{ background:'#3D35A8' }}>
                    Add outfit
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayOutfits.map(o => (
                    <CalendarOutfitCard key={o.id} outfit={o} onTap={() => openDetail(o)} onItemTap={item => setPeekedItem(item)}/>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Floating + button */}
      <button
        onClick={() => openCreate()}
        className="absolute bottom-20 right-4 text-white rounded-full p-4 z-10"
        style={{ background:'#3D35A8', boxShadow:'0 4px 16px rgba(61,53,168,0.4)' }}>
        <Plus size={28}/>
      </button>

      {peekedItem && <ClosetItemSheet item={peekedItem} onClose={() => setPeekedItem(null)}/>}
      {addToColOutfit && view === 'records' && (
        <AddToCollectionSheet
          outfit={addToColOutfit} collections={collections}
          onClose={() => setAddToColOutfit(null)}
          onAdded={handleAddToCollection}
          onCreateNew={() => { setAddToColOutfit(null); setCollectionSubView('create'); }}
        />
      )}
    </div>
  );
}
