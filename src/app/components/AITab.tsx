import { useState, useEffect } from 'react';
import { Sparkles, Sun, RefreshCw, Heart, Check, Shuffle, BookMarked, Clock, Plus, X, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getStyles, subscribeStyles } from '../store/styleTags';
import { ClothingItem, getItems, getIdleItems, getRecentItems, subscribeWardrobe } from '../store/wardrobe';
import { addOutfit, getOutfits, subscribeOutfits, OutfitRecord } from '../store/outfits';
import { getColorTones, getColorPalette, getTodayDate } from '../../data/index';

/* ─── Shared tokens ──────────────────────────────────────────────── */
const PAGE_BG    = '#F8F7FF';
const LABEL_STYLE = { fontSize: 11, color: '#AFA9EC', fontWeight: 600 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const };
const CARD_BORDER = '1px solid #EEEDFE';
const TITLE_FONT  = { fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' as const };

/* ─── Item interfaces ────────────────────────────────────────────── */
interface SuggestItem { emoji: string; label: string; colorHex: string; image?: string; }

interface OutfitItem {
  role: string;
  name?: string;
  emoji: string;
  colorHex: string;
  image?: string;
}

interface SuggestOutfit {
  label: string;
  tags: string[];
  items: OutfitItem[];
}

interface OutfitCard {
  id: string;
  label: string;
  items: OutfitItem[];
  tags: string[];
}

/* ─── Dynamic outfit generators ──────────────────────────────────── */
function roleToType(role: string): string {
  return ({ Top:'Top', Bottom:'Bottom', Shoes:'Shoes', Outer:'Outerwear', Accessory:'Accessories' } as Record<string,string>)[role] ?? role;
}

function pickFrom(arr: ClothingItem[], s: number): ClothingItem | null {
  return arr.length > 0 ? arr[Math.abs(s) % arr.length] : null;
}

function generateOutfitFromWardrobe(wardrobeItems: ClothingItem[], seed: number): OutfitCard {
  const tops        = wardrobeItems.filter(i => i.type === 'Top');
  const bottoms     = wardrobeItems.filter(i => i.type === 'Bottom');
  const shoes       = wardrobeItems.filter(i => i.type === 'Shoes');
  const outerwear   = wardrobeItems.filter(i => i.type === 'Outerwear');
  const accessories = wardrobeItems.filter(i => i.type === 'Accessories');

  const toItem = (role: string, c: ClothingItem): OutfitItem =>
    ({ role, name: c.name, emoji: c.emoji, colorHex: c.colorHex, image: c.image });

  const items: OutfitItem[] = [];

  const top    = pickFrom(tops,    seed);
  const bottom = pickFrom(bottoms, seed + 1);
  const shoe   = pickFrom(shoes,   seed + 2);
  if (top)    items.push(toItem('Top',    top));
  if (bottom) items.push(toItem('Bottom', bottom));
  if (shoe)   items.push(toItem('Shoes',  shoe));

  // Optional outerwear ~40%
  if (outerwear.length > 0 && seed % 5 < 2) {
    const outer = pickFrom(outerwear, seed + 3);
    if (outer) items.unshift(toItem('Outer', outer));
  }
  // Optional accessories ~30%
  if (accessories.length > 0 && seed % 10 < 3) {
    const acc = pickFrom(accessories, seed + 4);
    if (acc) items.push(toItem('Accessory', acc));
  }

  const labels  = ['Clean Casual', 'Sporty Vibe', 'Street Style', 'Smart Casual', 'Weekend Minimal', 'Elevated Look'];
  const tagSets = [['Casual','Spring'],['Sporty','Casual'],['Street','Cool'],['Minimal','All Season'],['Minimal','Casual'],['Elegant','Minimal']];
  const li      = Math.abs(seed) % labels.length;
  return { id: `gen_${seed}`, label: labels[li], tags: tagSets[li], items };
}

function generateSuggestOutfit(
  coreIdx: number,
  source: 'idle90' | 'justAdded',
  wardrobeItems: ClothingItem[],
  regenCount: number,
): SuggestOutfit {
  const sourceItems = source === 'idle90'
    ? [...wardrobeItems].sort((a, b) => a.wearCount - b.wearCount).slice(0, 3)
    : [...wardrobeItems].slice(0, 3);

  const coreItem = sourceItems[coreIdx] ?? sourceItems[0];
  if (!coreItem) return { label: 'Your Look', tags: ['Casual'], items: [] };

  const seed   = coreIdx * 13 + regenCount * 7;
  const others = wardrobeItems.filter(i => i.id !== coreItem.id);
  const tops        = others.filter(i => i.type === 'Top');
  const bottoms     = others.filter(i => i.type === 'Bottom');
  const shoes       = others.filter(i => i.type === 'Shoes');
  const outerwear   = others.filter(i => i.type === 'Outerwear');
  const accessories = others.filter(i => i.type === 'Accessories');

  const toItem = (role: string, c: ClothingItem): OutfitItem =>
    ({ role, name: c.name, emoji: c.emoji, colorHex: c.colorHex, image: c.image });

  const items: OutfitItem[] = [];

  if (coreItem.type === 'Top') {
    items.push(toItem('Top', coreItem));
    const b = pickFrom(bottoms, seed);     if (b) items.push(toItem('Bottom', b));
    const s = pickFrom(shoes,   seed + 1); if (s) items.push(toItem('Shoes',  s));
  } else if (coreItem.type === 'Bottom') {
    const t = pickFrom(tops,  seed);       if (t) items.push(toItem('Top',    t));
    items.push(toItem('Bottom', coreItem));
    const s = pickFrom(shoes, seed + 1);   if (s) items.push(toItem('Shoes',  s));
  } else if (coreItem.type === 'Shoes') {
    const t = pickFrom(tops,    seed);     if (t) items.push(toItem('Top',    t));
    const b = pickFrom(bottoms, seed + 1); if (b) items.push(toItem('Bottom', b));
    items.push(toItem('Shoes', coreItem));
  } else {
    // Outerwear / Accessories as core
    const t = pickFrom(tops,    seed);     if (t) items.push(toItem('Top',    t));
    const b = pickFrom(bottoms, seed + 1); if (b) items.push(toItem('Bottom', b));
    const s = pickFrom(shoes,   seed + 2); if (s) items.push(toItem('Shoes',  s));
    items.push(toItem(coreItem.type, coreItem));
  }

  if (coreItem.type !== 'Outerwear' && outerwear.length > 0 && seed % 5 < 2) {
    const o = pickFrom(outerwear, seed + 3); if (o) items.unshift(toItem('Outer', o));
  }
  if (coreItem.type !== 'Accessories' && accessories.length > 0 && seed % 10 < 3) {
    const a = pickFrom(accessories, seed + 4); if (a) items.push(toItem('Accessory', a));
  }

  const labels  = ['Curated Look', 'Styled Set', 'Weekend Vibe', 'Clean Combo', 'Signature Style'];
  const tagSets = [['Minimal','Curated'],['Casual','Spring'],['Weekend','Casual'],['Minimal','Clean'],['Style','Signature']];
  const li = Math.abs(seed) % labels.length;
  return { label: labels[li], tags: tagSets[li], items };
}

/* ─── Two side-by-side suggest cards ────────────────────────────── */
function AISuggestCard({
  type, items, onTap,
}: {
  type: 'idle90' | 'justAdded';
  items: SuggestItem[];
  onTap: () => void;
}) {
  const isIdle      = type === 'idle90';
  const accentColor = isIdle ? '#EF4444' : '#6C5CE7';
  const badgeBg     = isIdle ? '#FEF2F2' : '#F0EEFF';
  const badgeLabel  = isIdle ? 'Idle 90+' : 'Just Add+';
  const title       = isIdle ? 'Dust off a classic' : 'Debut something new';
  const sub         = isIdle ? '3 idle items' : '3 newly added';

  return (
    <button onClick={onTap} className="flex-1 text-left transition-opacity active:opacity-75"
      style={{ background: 'white', borderRadius: 20, border: CARD_BORDER,
        borderLeft: `3px solid ${accentColor}`, padding: '14px 13px',
        fontFamily: "'DM Sans', sans-serif" }}>

      <div className="inline-flex items-center gap-1 mb-2.5"
        style={{ background: badgeBg, borderRadius: 999, padding: '3px 8px' }}>
        {isIdle ? <Clock size={9} color={accentColor}/> : <Sparkles size={9} color={accentColor}/>}
        <span style={{ fontSize: 9, fontWeight: 700, color: accentColor }}>{badgeLabel}</span>
      </div>

      <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1560', lineHeight: 1.4, marginBottom: 3 }}>{title}</p>
      <p style={{ fontSize: 10, color: '#AFA9EC', marginBottom: 10 }}>{sub}</p>

      <div className="flex gap-1.5 mb-3">
        {items.map((it, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: it.colorHex + '40', border: CARD_BORDER, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
            {it.image
              ? <img src={it.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
              : it.emoji}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: accentColor }}>Tap to style →</p>
    </button>
  );
}

/* ─── Screen 1: Item selection ───────────────────────────────────── */
function ItemSelectScreen({
  source, items, selected, onSelect, onClose, onGenerate,
}: {
  source: 'idle90' | 'justAdded';
  items: SuggestItem[];
  selected: number | null;
  onSelect: (i: number) => void;
  onClose: () => void;
  onGenerate: () => void;
}) {
  const accentColor = source === 'idle90' ? '#EF4444' : '#6C5CE7';

  return (
    <div className="flex flex-col h-full" style={{ background: '#F8F7FF', fontFamily: "'DM Sans',sans-serif" }}>
      <div className="px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center mb-2">
          <button onClick={onClose} className="flex items-center gap-0.5 flex-shrink-0"
            style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>
            <ChevronLeft size={20}/> Back
          </button>
          <h2 style={{ fontSize:17, fontWeight:800, color:'#1a1560', flex:1, textAlign:'center' }}>
            Choose Core Item
          </h2>
          <div style={{ width:52, flexShrink:0 }}/>
        </div>
        <p style={{ fontSize: 12, color: '#7F77DD', textAlign:'center' }}>This piece anchors your outfit</p>
      </div>

      <div className="flex-1 px-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3 pt-1">
          {items.map((item, i) => {
            const isSelected = selected === i;
            return (
              <button key={i} onClick={() => onSelect(i)}
                className="flex flex-col items-center transition-all active:scale-95"
                style={{ background: isSelected ? '#EDE9FE' : 'white',
                  borderRadius: 20, border: isSelected ? `2px solid ${accentColor}` : CARD_BORDER,
                  padding: '16px 8px 14px', position: 'relative' }}>

                {isSelected && (
                  <div className="absolute top-2 right-2 flex items-center justify-center rounded-full"
                    style={{ width: 18, height: 18, background: accentColor }}>
                    <Check size={10} color="white" strokeWidth={3}/>
                  </div>
                )}

                <div className="flex items-center justify-center rounded-2xl mb-3 overflow-hidden"
                  style={{ width: 72, height: 80, background: item.colorHex + '30', fontSize: 38 }}>
                  {item.image
                    ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                    : item.emoji}
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1560', textAlign: 'center', lineHeight: 1.3 }}>
                  {item.label}
                </p>
                <div className="mt-1.5 rounded-full"
                  style={{ width: 12, height: 12, background: item.colorHex,
                    border: item.colorHex === '#E5E7EB' || item.colorHex === '#F5F5F5' ? '1.5px solid #D1D5DB' : 'none' }}/>
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: accentColor + '12', border: `1px solid ${accentColor}30` }}>
            {items[selected].image
              ? <img src={items[selected].image} style={{ width:24, height:24, objectFit:'contain', borderRadius:6 }} alt=""/>
              : <span style={{ fontSize: 20 }}>{items[selected].emoji}</span>}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1560' }}>
                {items[selected].label} selected
              </p>
              <p style={{ fontSize: 10, color: '#7F77DD' }}>Ready to generate your outfit</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-10 pt-4 flex gap-3 flex-shrink-0">
        <button onClick={onClose}
          className="flex-1 h-12 rounded-full font-semibold text-sm"
          style={{ background: 'white', border: `2px solid #EEEDFE`, color: '#7F77DD' }}>
          Cancel
        </button>
        <button onClick={onGenerate} disabled={selected === null}
          className="flex-1 h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2 text-white transition-opacity"
          style={{ background: selected !== null ? '#3D35A8' : '#AFA9EC' }}>
          <Sparkles size={15}/>
          Generate
        </button>
      </div>
    </div>
  );
}

/* ─── Screen 2: Generating animation ────────────────────────────── */
function GeneratingScreen({ coreItem }: { coreItem: SuggestItem }) {
  const surrounding = ['👖', '👟', '🧣', '👜', '🕶️'];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8"
      style={{ background: '#F8F7FF', fontFamily: "'DM Sans',sans-serif" }}>

      <div className="mb-6 relative" style={{ width: 160, height: 160 }}>
        {surrounding.map((em, i) => {
          const angle = (i / surrounding.length) * 360;
          const rad   = (angle * Math.PI) / 180;
          const cx    = 80 + 65 * Math.cos(rad);
          const cy    = 80 + 65 * Math.sin(rad);
          return (
            <div key={i} style={{
              position: 'absolute', left: cx - 18, top: cy - 18,
              width: 36, height: 36, borderRadius: 9, background: '#EEEDFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, opacity: 0.7,
              animation: `pulse ${1.2 + i * 0.2}s ease-in-out infinite alternate`,
            }}>{em}</div>
          );
        })}
        <div className="absolute flex items-center justify-center rounded-3xl overflow-hidden"
          style={{ left: 40, top: 40, width: 80, height: 80,
            background: coreItem.colorHex + '50',
            border: '2px solid #3D35A8', zIndex: 1 }}>
          {coreItem.image
            ? <img src={coreItem.image} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
            : <span style={{ fontSize: 40 }}>{coreItem.emoji}</span>}
        </div>
      </div>

      <p style={{ fontSize: 18, fontWeight: 800, color: '#1a1560', marginBottom: 8, textAlign: 'center' }}>
        AI is mixing your look…
      </p>
      <p style={{ fontSize: 13, color: '#7F77DD', textAlign: 'center' }}>
        Building an outfit around {coreItem.label}
      </p>

      <style>{`@keyframes pulse { from { transform:scale(0.85); opacity:0.5; } to { transform:scale(1.05); opacity:0.9; } }`}</style>
    </div>
  );
}

/* ─── Screen 3: Suggest result ───────────────────────────────────── */
function SuggestResultScreen({
  outfit, regenerating, onClose, onRegenerate, onAdd,
}: {
  outfit: SuggestOutfit;
  regenerating: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#F8F7FF', fontFamily: "'DM Sans',sans-serif" }}>
      <div className="px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center">
          <button onClick={onClose} className="flex items-center gap-0.5 flex-shrink-0"
            style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>
            <ChevronLeft size={20}/> Back
          </button>
          <h2 style={{ fontSize:17, fontWeight:800, color:'#1a1560', flex:1, textAlign:'center' }}>
            Your Outfit
          </h2>
          <div style={{ width:52, flexShrink:0 }}/>
        </div>
      </div>

      <div className="flex-1 px-5 overflow-y-auto pb-4">
        <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: CARD_BORDER }}>
          <div className="px-5 pt-5 pb-4">
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1560', marginBottom: 8 }}>{outfit.label}</p>
            <div className="flex gap-1.5 flex-wrap">
              {outfit.tags.map((t) => (
                <span key={t} className="rounded-full px-2.5 py-1"
                  style={{ background: '#F0EEFF', color: '#3D35A8', fontSize: 10, fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="px-5 pb-5 grid grid-cols-3 gap-3">
            {outfit.items.slice(0, 6).map((item, i) => (
              <div key={i} className="flex flex-col items-center rounded-2xl overflow-hidden"
                style={{ border: CARD_BORDER, background: '#FAFAFA' }}>
                <div className="flex items-center justify-center w-full overflow-hidden"
                  style={{ height: 80, background: item.colorHex + '25' }}>
                  {item.image
                    ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain', padding:'4px' }} alt=""/>
                    : <span style={{ fontSize: 38 }}>{item.emoji}</span>}
                </div>
                <div className="px-2 py-2 w-full text-center">
                  <p style={{ fontSize: 9, color: '#AFA9EC', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.role}</p>
                  {item.name && (
                    <p style={{ fontSize: 9, color: '#555', marginTop: 1, lineHeight: 1.3 }}>{item.name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 px-4 py-3 rounded-2xl flex items-start gap-2.5"
            style={{ background: '#F0EEFF' }}>
            <Sparkles size={14} color="#3D35A8" className="flex-shrink-0 mt-0.5"/>
            <p style={{ fontSize: 11, color: '#3D35A8', lineHeight: 1.5 }}>
              This look is tailored to your wardrobe and the current weather. Not feeling it? Regenerate for a fresh pick.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-10 pt-2 space-y-2.5 flex-shrink-0">
        <button onClick={onAdd}
          className="w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2 text-white"
          style={{ background: '#1A1A40' }}>
          <Plus size={15}/> Add to Outfit
        </button>
        <button onClick={onRegenerate} disabled={regenerating}
          className="w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: 'white', border: `2px solid #EEEDFE`, color: '#3D35A8' }}>
          <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''}/>
          {regenerating ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}

/* ─── Preference data from data layer ─────────────────────────────── */
const colorPalette = getColorPalette();
const TONES = getColorTones().map(tone => ({
  name: tone.name,
  colors: tone.colors.map(colorName => {
    const colorEntry = colorPalette.find(c => c.name === colorName);
    return colorEntry ? { name: colorName, hex: colorEntry.hex, light: colorEntry.light } : { name: colorName, hex: '#888888' };
  })
}));

/* ─── Main outfit result card ────────────────────────────────────── */
function OutfitResultCard({ outfit, saved, onSave, onAddToOutfit }: {
  outfit: OutfitCard; saved: boolean; onSave: () => void; onAddToOutfit: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: CARD_BORDER }}>
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1560' }}>{outfit.label}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {outfit.tags.map((t) => (
              <span key={t} className="rounded-full px-2 py-0.5"
                style={{ background: '#F0EEFF', color: '#3D35A8', fontSize: 10, fontWeight: 700 }}>{t}</span>
            ))}
          </div>
        </div>
        <button onClick={onSave}
          className="flex-shrink-0 ml-2 flex items-center justify-center rounded-full"
          style={{ width: 32, height: 32, background: saved ? '#3D35A8' : '#F0EEFF', border: saved ? 'none' : CARD_BORDER }}>
          {saved ? <Check size={14} color="white"/> : <Heart size={14} color="#3D35A8"/>}
        </button>
      </div>
      <div className={`px-4 pb-3.5 ${outfit.items.length > 3 ? 'flex gap-2 overflow-x-auto pb-2' : 'grid grid-cols-3 gap-2'}`}>
        {outfit.items.map((item, i) => (
          <div key={i} className="rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: CARD_BORDER, width: outfit.items.length > 3 ? 76 : 'auto' }}>
            <div className="flex items-center justify-center overflow-hidden"
              style={{ height: 64, background: item.colorHex + '30' }}>
              {item.image
                ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain', padding:'4px' }} alt=""/>
                : <span style={{ fontSize: 28 }}>{item.emoji}</span>}
            </div>
            <div className="px-1.5 py-1.5" style={{ background: 'white' }}>
              <p style={{ fontSize: 9, color: '#AFA9EC', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.role}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={() => {
          addOutfit({
            id: `ai_cal_${Date.now()}`,
            date: getTodayDate(),
            style: outfit.tags[0] ?? 'Casual',
            label: outfit.label,
            isCalendarOnly: true,
            outfitItems: outfit.items.map((item, i) => ({
              id: `ai_${i}_${Date.now()}`,
              type: roleToType(item.role),
              emoji: item.emoji,
              color: item.name ?? item.role,
              colorHex: item.colorHex,
              image: item.image,
              name: item.name,
            })),
          });
          toast.success("Outfit recorded for today");
        }} className="flex-1 h-9 rounded-full font-semibold text-sm text-white" style={{ background: '#3D35A8' }}>
          Wear Today
        </button>
        <button onClick={onAddToOutfit}
          className="flex-1 h-9 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5"
          style={{ background: '#F0EEFF', color: '#3D35A8', border: CARD_BORDER }}>
          <Plus size={13}/> Add to Outfit
        </button>
      </div>
    </div>
  );
}

/* ─── Saved outfit card for "from saved outfits" result view ─────── */
function SavedOutfitCard({ outfit, onNavigate }: { outfit: OutfitRecord; onNavigate: (tab: string) => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: CARD_BORDER }}>
      <div className="flex gap-3 p-3 items-center">
        {outfit.mannequinImage && (
          <div style={{ width:70, height:92, borderRadius:12, overflow:'hidden', background:'#EEEDFE', flexShrink:0 }}>
            <img src={outfit.mannequinImage} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} alt=""/>
          </div>
        )}
        {outfit.avatarImage && (
          <div style={{ width:40, height:60, borderRadius:8, overflow:'hidden', flexShrink:0, border: CARD_BORDER }}>
            <img src={outfit.avatarImage} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1560', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {outfit.label ?? 'Untitled Outfit'}
          </p>
          <span style={{ fontSize:10, fontWeight:700, background:'#F0EEFF', color:'#3D35A8', borderRadius:999, padding:'2px 8px' }}>
            {outfit.style}
          </span>
          <div className="flex gap-1.5 mt-2" style={{ overflowX:'auto', scrollbarWidth:'none' }}>
            {outfit.outfitItems.map((item, i) => (
              <div key={i} style={{ width:30, height:38, borderRadius:6, overflow:'hidden', flexShrink:0,
                background:item.colorHex+'33', border: CARD_BORDER }}>
                {item.image
                  ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{item.emoji}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button onClick={() => {
          addOutfit({
            id: `ai_cal_${Date.now()}`,
            date: getTodayDate(),
            style: outfit.tags[0] ?? 'Casual',
            label: outfit.label,
            isCalendarOnly: true,
            outfitItems: outfit.items.map((item, i) => ({
              id: `ai_${i}_${Date.now()}`,
              type: roleToType(item.role),
              emoji: item.emoji,
              color: item.name ?? item.role,
              colorHex: item.colorHex,
              image: item.image,
              name: item.name,
            })),
          });
          toast.success("Outfit recorded for today");
          onNavigate('outfit');
        }}
          className="w-full h-10 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-1.5"
          style={{ background:'#3D35A8' }}>
          <Check size={13}/> Wear Today
        </button>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function AITab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedTone,  setSelectedTone]  = useState('');
  const [generated,     setGenerated]     = useState(false);
  const [generating,    setGenerating]    = useState(false);
  const [genSource,     setGenSource]     = useState<'wardrobe'|'saved'>('wardrobe');
  const [genSeed,       setGenSeed]       = useState(0);
  const [saved,         setSaved]         = useState<Set<string>>(new Set());
  const [dynStyles,     setDynStyles]     = useState(getStyles());
  const [wardrobeItems, setWardrobeItems] = useState(getItems());
  const [savedOutfits,  setSavedOutfits]  = useState<OutfitRecord[]>(getOutfits());

  useEffect(() => subscribeWardrobe(() => setWardrobeItems(getItems())), []);
  useEffect(() => subscribeStyles(() => setDynStyles(getStyles())), []);
  useEffect(() => subscribeOutfits(() => setSavedOutfits(getOutfits())), []);

  /* Suggest flow state */
  const [suggestSource,    setSuggestSource]    = useState<'idle90'|'justAdded'|null>(null);
  const [suggestStep,      setSuggestStep]      = useState<'select'|'generating'|'result'>('select');
  const [suggestSelected,  setSuggestSelected]  = useState<number|null>(null);
  const [suggestResultIdx, setSuggestResultIdx] = useState(0);
  const [suggestRegen,     setSuggestRegen]     = useState(false);

  /* Dynamic results from real wardrobe */
  const results: OutfitCard[] = [0, 1, 2].map((i) =>
    generateOutfitFromWardrobe(wardrobeItems, genSeed + i * 17)
  );

  function handleGenerate(source: 'wardrobe'|'saved') {
    setGenSource(source);
    setGenerating(true);
    setGenSeed(source === 'wardrobe' ? Date.now() % 997 : (Date.now() % 997) + 500);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1100);
  }
  function handleRegenerate() {
    setGenerating(true);
    setGenSeed(prev => (prev + 31) % 997);
    setTimeout(() => setGenerating(false), 900);
  }
  function toggleSave(id: string) {
    setSaved((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function handleAddToOutfit(outfit: OutfitCard) {
    addOutfit({
      id: Date.now().toString(),
      date: getTodayDate(),
      style: outfit.tags[0] ?? 'Casual',
      label: outfit.label,
      outfitItems: outfit.items.map((item, i) => ({
        id: `ai_${i}_${Date.now()}`,
        type: roleToType(item.role),
        emoji: item.emoji,
        color: item.name ?? item.role,
        colorHex: item.colorHex,
        image: item.image,
        name: item.name,
      })),
    });
    onNavigate('outfit');
  }

  function handleSuggestSave(outfit: SuggestOutfit) {
    addOutfit({
      id: Date.now().toString(),
      date: getTodayDate(),
      style: outfit.tags[0] ?? 'Casual',
      label: outfit.label,
      outfitItems: outfit.items.map((item, i) => ({
        id: `suggest_${i}_${Date.now()}`,
        type: roleToType(item.role),
        emoji: item.emoji,
        color: item.name ?? item.role,
        colorHex: item.colorHex,
        image: item.image,
        name: item.name,
      })),
    });
  }

  /* Suggest flow handlers */
  function openSuggest(source: 'idle90'|'justAdded') {
    setSuggestSource(source);
    setSuggestStep('select');
    setSuggestSelected(null);
    setSuggestResultIdx(0);
  }
  function handleSuggestGenerate() {
    if (suggestSelected === null) return;
    setSuggestStep('generating');
    setTimeout(() => setSuggestStep('result'), 1600);
  }
  function handleSuggestRegenerate() {
    setSuggestRegen(true);
    setTimeout(() => {
      setSuggestResultIdx(i => i + 1);
      setSuggestRegen(false);
    }, 900);
  }
  function handleSuggestAdd() {
    if (suggestOutfit) handleSuggestSave(suggestOutfit);
    setSuggestSource(null);
    onNavigate('outfit');
  }

  const liveIdleItems   = getIdleItems(3).map(i => ({ emoji: i.emoji, label: i.name, colorHex: i.colorHex, image: i.image }));
  const liveRecentItems = getRecentItems(3).map(i => ({ emoji: i.emoji, label: i.name, colorHex: i.colorHex, image: i.image }));
  const suggestItems    = suggestSource === 'idle90' ? liveIdleItems : liveRecentItems;

  const suggestOutfit: SuggestOutfit | null = (() => {
    if (!suggestSource || suggestSelected === null) return null;
    return generateSuggestOutfit(suggestSelected, suggestSource, wardrobeItems, suggestResultIdx);
  })();

  return (
    <div className="relative h-full flex flex-col overflow-hidden"
      style={{ background: PAGE_BG, fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-3 flex-shrink-0">
        <div className="flex items-center mb-2">
          {generated ? (
            <button onClick={() => setGenerated(false)} className="flex items-center gap-0.5 flex-shrink-0"
              style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>
              <ChevronLeft size={20}/> Back
            </button>
          ) : (
            <div style={{ width:52, flexShrink:0 }}/>
          )}
          <h1 style={{ ...TITLE_FONT, fontWeight: 800, fontSize: 28, color: '#1a1560', lineHeight: 1.1,
            flex:1, textAlign:'center' }}>
            AI Recommend
          </h1>
          <div style={{ width:52, flexShrink:0 }}/>
        </div>
        <p style={{ fontSize: 13, color: '#7F77DD', marginTop: 2, textAlign:'center', marginBottom:3 }}>
          Outfits curated from your wardrobe
        </p>

        {/* Weather strip */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: '#3D35A8' }}>
          <Sun size={22} className="text-amber-400 flex-shrink-0"/>
          <div className="flex-1">
            <p style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Sunny · 22°C</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Melbourne — good day for light layers</p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5">

        {!generated ? (
          <div className="space-y-5">

            {/* ── Style ─────────────────────────────────── */}
            <div>
              <p style={{ ...LABEL_STYLE, marginBottom: 8 }}>What style are you looking for?</p>
              <div className="grid grid-cols-4 gap-1.5">
                {dynStyles.map((s) => (
                  <button key={s} onClick={() => setSelectedStyle(s === selectedStyle ? '' : s)}
                    className="h-8 w-full rounded-full text-xs font-semibold text-center transition-colors"
                    style={{ background: selectedStyle===s ? '#3D35A8' : 'white',
                      color: selectedStyle===s ? 'white' : '#7F77DD',
                      border: selectedStyle===s ? 'none' : CARD_BORDER }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Color Tone ────────────────────────────── */}
            <div>
              <p style={{ ...LABEL_STYLE, marginBottom: 8 }}>Color Tone</p>
              <div className="space-y-2">
                {TONES.map((tone) => {
                  const active = selectedTone === tone.name;
                  return (
                    <button key={tone.name} onClick={() => setSelectedTone(active ? '' : tone.name)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-colors text-left"
                      style={{ background: active ? '#EDE9FE' : 'white', border: active ? '2px solid #3D35A8' : CARD_BORDER }}>
                      <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', width: 88, flexShrink: 0,
                        color: active ? '#3D35A8' : '#7F77DD' }}>{tone.name}</span>
                      <div className="flex items-center gap-1.5 flex-1">
                        {tone.colors.map((c) => (
                          <div key={c.name} title={c.name}
                            style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                              backgroundColor: c.hex,
                              border: c.light ? '1.5px solid #D1D5DB' : '1px solid rgba(0,0,0,0.06)' }}/>
                        ))}
                      </div>
                      {active && (
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#3D35A8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={10} color="white" strokeWidth={3}/>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Generate buttons ──────────────────────── */}
            <div className="space-y-2.5 pt-1">
              <button onClick={() => handleGenerate('wardrobe')} disabled={generating}
                className="w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2.5 text-white"
                style={{ background: generating && genSource==='wardrobe' ? '#AFA9EC' : '#3D35A8' }}>
                {generating && genSource==='wardrobe'
                  ? <><RefreshCw size={15} className="animate-spin"/>Generating…</>
                  : <><Shuffle size={15}/>AI picks from my wardrobe</>}
              </button>
              <button onClick={() => handleGenerate('saved')} disabled={generating}
                className="w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2.5"
                style={{ background: generating&&genSource==='saved'?'#3D35A8':'white',
                  color: generating&&genSource==='saved'?'white':'#3D35A8', border: `2px solid #3D35A8` }}>
                {generating && genSource==='saved'
                  ? <><RefreshCw size={15} className="animate-spin"/>Generating…</>
                  : <><BookMarked size={15}/>AI picks from saved outfits</>}
              </button>
            </div>

            {/* ── AI Suggests — two side-by-side cards ──── */}
            <div className="pb-2">
              <p style={{ ...LABEL_STYLE, marginBottom: 10 }}>AI Suggests</p>
              <div className="flex gap-3">
                <AISuggestCard type="idle90"    items={liveIdleItems}   onTap={() => openSuggest('idle90')}/>
                <AISuggestCard type="justAdded" items={liveRecentItems} onTap={() => openSuggest('justAdded')}/>
              </div>
            </div>

          </div>
        ) : (
          /* ── Results view ─────────────────────────────── */
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1560' }}>
                  {genSource === 'saved' ? savedOutfits.length : results.length} outfit{(genSource === 'saved' ? savedOutfits.length : results.length) !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: 12, color: '#AFA9EC', marginTop: 2 }}>
                  {genSource==='wardrobe' ? 'From your wardrobe' : 'From saved outfits'}{selectedStyle ? ` · ${selectedStyle}` : ''}
                </p>
              </div>
              {genSource === 'wardrobe' && (
                <button onClick={handleRegenerate} disabled={generating}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2"
                  style={{ background: '#F0EEFF', border: CARD_BORDER, color: '#3D35A8', fontSize: 12, fontWeight: 600 }}>
                  {generating
                    ? <><RefreshCw size={12} className="animate-spin"/>Generating…</>
                    : <><Sparkles size={12}/>Regenerate</>}
                </button>
              )}
            </div>
            {genSource === 'saved' ? (
              savedOutfits.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <p style={{ fontSize:14, fontWeight:600, color:'#AFA9EC' }}>No saved outfits yet</p>
                  <p style={{ fontSize:12, color:'#AFA9EC', textAlign:'center' }}>Create some outfit records first in Outfit Records.</p>
                </div>
              ) : (
                savedOutfits.map((outfit) => (
                  <SavedOutfitCard key={outfit.id} outfit={outfit} onNavigate={onNavigate}/>
                ))
              )
            ) : (
              results.map((outfit) => (
                <OutfitResultCard
                  key={outfit.id} outfit={outfit}
                  saved={saved.has(outfit.id)} onSave={() => toggleSave(outfit.id)}
                  onAddToOutfit={() => handleAddToOutfit(outfit)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Suggest flow overlay ─────────────────────────── */}
      {suggestSource && (
        <div className="absolute inset-0 z-50">
          {suggestStep === 'select' && (
            <ItemSelectScreen
              source={suggestSource}
              items={suggestItems}
              selected={suggestSelected}
              onSelect={setSuggestSelected}
              onClose={() => setSuggestSource(null)}
              onGenerate={handleSuggestGenerate}
            />
          )}
          {suggestStep === 'generating' && suggestSelected !== null && (
            <GeneratingScreen coreItem={suggestItems[suggestSelected]}/>
          )}
          {suggestStep === 'result' && suggestOutfit && (
            <SuggestResultScreen
              outfit={suggestOutfit}
              regenerating={suggestRegen}
              onClose={() => { setSuggestStep('select'); setSuggestSelected(null); }}
              onRegenerate={handleSuggestRegenerate}
              onAdd={handleSuggestAdd}
            />
          )}
        </div>
      )}
    </div>
  );
}
