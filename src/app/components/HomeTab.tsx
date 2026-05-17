import { useState, useEffect } from 'react';
import { Sparkles, Cloud, ChevronRight, Clock, ArrowLeft, Lightbulb, Repeat2, Star, X, RefreshCw } from 'lucide-react';
import avatarImg from '../../imports/ChatGPT_Image_2026_5_13__17_27_04.png';
import { ClothingItem, getItems, subscribeWardrobe } from '../store/wardrobe';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const PAGE_BG     = '#F8F7FF';
const CARD_BORDER = '1px solid #EEEDFE';
const LABEL_STYLE = { fontSize: 11, color: '#AFA9EC', fontWeight: 600 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const };
const TITLE_FONT  = { fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' as const };

/* ─── Donut ──────────────────────────────────────────────────────── */
const DONUT_R = 44, DONUT_C = 2 * Math.PI * DONUT_R;
function DonutChart({ segments }: { segments: { label:string; pct:number; color:string }[] }) {
  let cum = 0;
  const arcs = segments.map((s) => { const len = DONUT_C*(s.pct/100); const r = {...s, dashLen:len-3.5, offset:-cum}; cum+=len; return r; });
  return (
    <svg viewBox="0 0 120 120" className="w-full">
      <g transform="rotate(-90 60 60)">
        {arcs.map((arc, i) => (
          <circle key={i} cx="60" cy="60" r={DONUT_R} fill="none" stroke={arc.color} strokeWidth="15"
            strokeDasharray={`${arc.dashLen} ${DONUT_C}`} strokeDashoffset={arc.offset} strokeLinecap="butt"/>
        ))}
      </g>
    </svg>
  );
}

/* ─── Score arc ──────────────────────────────────────────────────── */
function ScoreArc({ score }: { score: number }) {
  const R = 46, half = Math.PI * R;
  const fill = (score / 100) * half;
  const color = score >= 75 ? '#22C55E' : score >= 55 ? '#FB923C' : '#EF4444';
  return (
    <svg viewBox="0 0 110 60" width={110} height={60}>
      <path d="M8 56 A46 46 0 0 1 102 56" fill="none" stroke="#EEEDFE" strokeWidth="10" strokeLinecap="round"/>
      <path d="M8 56 A46 46 0 0 1 102 56" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${fill} ${half}`}/>
      <text x="55" y="48" textAnchor="middle" fill="#1a1560"
        style={{ fontSize:22, fontWeight:800, fontFamily:"'DM Sans',sans-serif" }}>{score}</text>
      <text x="55" y="58" textAnchor="middle" fill="#AFA9EC"
        style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif" }}>/100</text>
    </svg>
  );
}

/* ─── Sun ────────────────────────────────────────────────────────── */
function SunSVG() {
  const rays = Array.from({length:8}, (_,i) => (i*360)/8);
  return (
    <svg width="68" height="68" viewBox="0 0 74 74" fill="none">
      {rays.map((deg,i) => { const r=(deg*Math.PI)/180;
        return <line key={i} x1={37+26*Math.cos(r)} y1={37+26*Math.sin(r)} x2={37+35*Math.cos(r)} y2={37+35*Math.sin(r)} stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round"/>; })}
      <circle cx="37" cy="37" r="19" fill="#FBBF24"/><circle cx="37" cy="37" r="13" fill="#FDE68A"/>
    </svg>
  );
}

/* ─── Clothing image tile (weather card) ─────────────────────────── */
function ClothingImageTile({ item }: { item: ClothingItem }) {
  return (
    <div className="bg-white/10 rounded-[14px] py-3 px-2 flex flex-col items-center gap-1.5">
      <div className="flex items-center justify-center rounded-xl overflow-hidden"
        style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)' }}>
        {item.image
          ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
          : <span style={{ fontSize: 32 }}>{item.emoji}</span>}
      </div>
      <p className="text-white text-[11px] font-semibold text-center leading-tight">{item.name}</p>
    </div>
  );
}

function HealthBar({ color, fill }: { color:string; fill:number }) {
  return (<div className="h-[3px] rounded-full overflow-hidden mt-1.5 mb-2.5" style={{background:'#EEEDFE'}}>
    <div className="h-full rounded-full" style={{width:`${fill}%`,backgroundColor:color}}/>
  </div>);
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (<div className="px-5 mb-2.5"><p style={LABEL_STYLE}>{children}</p></div>);
}

/* DUPE_GRID is now computed from real wardrobe data in HealthDetailView */

const TIPS = [
  { icon:'🎯', text:'Style challenge: wear one idle item every 3 days for 2 weeks.' },
  { icon:'🛍️', text:'Your wool coat + plaid skirt combo — a winter winner waiting to happen.' },
  { icon:'♻️', text:'Donate 5+ duplicates. Free up space, give to someone who needs it.' },
  { icon:'📸', text:'Photograph idle items to spark new outfit ideas.' },
];

/* ─── Item photo tile ────────────────────────────────────────────── */
function ItemPhotoTile({ emoji, colorHex, badge, badgeColor, image, onClick }: {
  emoji:string; colorHex:string; badge:string; badgeColor:string; image?: string; onClick?: () => void;
}) {
  return (
    <button className="relative rounded-2xl overflow-hidden w-full"
      style={{ aspectRatio:'3/4', background:colorHex+'28', display:'block' }}
      onClick={onClick}>
      <div className="absolute inset-0 flex items-center justify-center">
        {image
          ? <img src={image} style={{ width:'100%', height:'100%', objectFit:'contain', padding:'6px' }} alt=""/>
          : <span style={{ fontSize:36 }}>{emoji}</span>}
      </div>
      <div className="absolute bottom-2 inset-x-0 flex justify-center">
        <span style={{ background:'rgba(0,0,0,0.55)', color:'white', fontSize:9, fontWeight:700,
          borderRadius:999, padding:'2px 7px' }}>{badge}</span>
      </div>
      <div className="absolute top-2 right-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: badgeColor }}/>
      </div>
    </button>
  );
}

/* ─── Item detail bottom sheet (Health Report) ───────────────────── */
function ItemDetailSheet({ item, onClose }: { item: ClothingItem; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background:'rgba(26,21,96,0.35)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl pb-8"
        style={{ boxShadow:'0 -8px 40px rgba(61,53,168,0.18)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-2">
          <div style={{ width:36, height:4, borderRadius:99, background:'#EEEDFE' }}/>
        </div>
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            {item.closetId && (
              <span style={{ fontSize:10, fontWeight:800, background:'#EEEDFE', color:'#3D35A8',
                borderRadius:999, padding:'2px 8px' }}>{item.closetId}</span>
            )}
            <p style={{ fontSize:16, fontWeight:700, color:'#1a1560' }}>{item.name}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background:'#F0EEFF' }}>
            <X size={14} color="#3D35A8"/>
          </button>
        </div>
        <div className="mx-4 rounded-2xl overflow-hidden mb-4 flex items-center justify-center"
          style={{ height:200, background: item.colorHex + '22', border: CARD_BORDER }}>
          {item.image
            ? <img src={item.image} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
            : <span style={{ fontSize:56 }}>{item.emoji}</span>}
        </div>
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
          <div className="rounded-xl px-3 py-2 flex-1" style={{ background:'#F8F7FF', border:CARD_BORDER }}>
            <p style={{ fontSize:9, fontWeight:700, color:'#AFA9EC', textTransform:'uppercase', letterSpacing:'0.06em' }}>Worn</p>
            <p style={{ fontSize:13, fontWeight:600, color:'#1a1560', marginTop:2 }}>{item.wearCount}×</p>
          </div>
        </div>
        {item.styles.length > 0 && (
          <div className="px-4 mt-3 flex flex-wrap gap-1.5">
            {item.styles.map(s => (
              <span key={s} style={{ fontSize:10, fontWeight:600, background:'#EDE9FE', color:'#3D35A8',
                borderRadius:999, padding:'3px 10px' }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Health detail page ─────────────────────────────────────────── */
function HealthDetailView({ onBack, wardrobeItems }: { onBack: () => void; wardrobeItems: ClothingItem[] }) {
  const [activeSection, setActiveSection] = useState<'worn'|'idle'|'dupes'|'tips'>('worn');
  const [selectedItem, setSelectedItem] = useState<ClothingItem|null>(null);

  const mostWornItems = [...wardrobeItems].sort((a, b) => b.wearCount - a.wearCount).slice(0, 6);
  const idleItems     = [...wardrobeItems].sort((a, b) => a.wearCount - b.wearCount).slice(0, 6);

  // Compute duplicate items: types that appear 2+ times, show up to 2 per type, max 6 total
  const dupeItems = (() => {
    const byType: Record<string, ClothingItem[]> = {};
    wardrobeItems.forEach(i => { byType[i.type] = byType[i.type] ?? []; byType[i.type].push(i); });
    return Object.entries(byType)
      .filter(([, arr]) => arr.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .flatMap(([, arr]) => arr.slice(0, 2))
      .slice(0, 6);
  })();

  const tabs = [
    { key:'worn'  as const, label:'Most Worn' },
    { key:'idle'  as const, label:'Idle' },
    { key:'dupes' as const, label:'Duplicates' },
    { key:'tips'  as const, label:'Tips' },
  ];

  return (
    <div className="h-full overflow-y-auto relative" style={{ background: PAGE_BG, fontFamily:"'DM Sans',sans-serif" }}>
      <div className="px-5 pt-12 pb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 mb-5"
          style={{ color:'#7F77DD', fontSize:14, fontWeight:500 }}>
          <ArrowLeft size={16}/> Back
        </button>
        <p style={LABEL_STYLE}>Wardrobe health</p>
        <h1 style={{ ...TITLE_FONT, fontWeight:800, fontSize:36, lineHeight:1.1, color:'#1a1560', marginTop:4 }}>
          Closet Report
        </h1>
        <p style={{ fontSize:13, color:'#7F77DD', marginTop:4 }}>Based on your {wardrobeItems.length} items</p>
      </div>

      <div className="mx-5 mb-5 bg-white rounded-[22px] p-5 flex items-center gap-5" style={{border:CARD_BORDER}}>
        <ScoreArc score={67}/>
        <div className="flex-1">
          <p style={{ fontSize:13, color:'#AFA9EC', fontWeight:600 }}>Health Score</p>
          <p style={{ fontSize:13, color:'#1a1560', fontWeight:700, marginTop:4 }}>Room to improve</p>
          <p style={{ fontSize:11, color:'#AFA9EC', marginTop:3, lineHeight:1.5 }}>
            12 idle &amp; 7 duplicates. Small wins go a long way.
          </p>
        </div>
      </div>

      <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
        {[{label:'12 Idle',color:'#F87171',bg:'#FEF2F2'},{label:'7 Dupes',color:'#FB923C',bg:'#FFF7ED'},
          {label:'62% Used',color:'#22C55E',bg:'#F0FDF4'},{label:'3.2× wear',color:'#3D35A8',bg:'#F0EEFF'}
        ].map(p=>(
          <span key={p.label} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{background:p.bg,color:p.color}}>{p.label}</span>
        ))}
      </div>

      <div className="flex gap-1.5 px-5 mb-4">
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveSection(t.key)}
            className="flex-1 h-8 rounded-full text-xs font-semibold transition-colors"
            style={{background:activeSection===t.key?'#3D35A8':'white',
              color:activeSection===t.key?'white':'#7F77DD',
              border:activeSection===t.key?'none':CARD_BORDER}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Most Worn ──────────────────────────────────────── */}
      {activeSection==='worn' && (
        <div className="px-5 mb-5">
          <p style={{fontSize:12,color:'#AFA9EC',marginBottom:12}}>Your 6 most-reached-for pieces</p>
          <div className="grid grid-cols-3 gap-2">
            {mostWornItems.map((item,i)=>(
              <ItemPhotoTile key={i} emoji={item.emoji} colorHex={item.colorHex}
                image={item.image} badge={`${item.wearCount}×`} badgeColor="#3D35A8"
                onClick={() => setSelectedItem(item)}/>
            ))}
          </div>
          {mostWornItems[0] && (
            <div className="mt-4 bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
              <div className="flex items-center gap-2 mb-2">
                <Star size={13} color="#3D35A8" fill="#3D35A8"/>
                <p style={{fontSize:12,fontWeight:700,color:'#1a1560'}}>Top performer</p>
              </div>
              <p style={{fontSize:12,color:'#7F77DD',lineHeight:1.6}}>
                Your {mostWornItems[0].name} worn {mostWornItems[0].wearCount}× — a wardrobe hero.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Idle Items ─────────────────────────────────────── */}
      {activeSection==='idle' && (
        <div className="px-5 mb-5">
          <p style={{fontSize:12,color:'#AFA9EC',marginBottom:12}}>Items worn least — top 6</p>
          <div className="grid grid-cols-3 gap-2">
            {idleItems.map((item,i)=>(
              <ItemPhotoTile key={i} emoji={item.emoji} colorHex={item.colorHex}
                image={item.image} badge={`${item.wearCount}×`} badgeColor="#F87171"
                onClick={() => setSelectedItem(item)}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Duplicates ─────────────────────────────────────── */}
      {activeSection==='dupes' && (
        <div className="px-5 mb-5">
          <p style={{fontSize:12,color:'#AFA9EC',marginBottom:12}}>Similar items you may not need all of — top 6</p>
          <div className="grid grid-cols-3 gap-2">
            {dupeItems.map((item,i)=>(
              <ItemPhotoTile key={i} emoji={item.emoji} colorHex={item.colorHex}
                image={item.image} badge={item.type} badgeColor="#FB923C"
                onClick={() => setSelectedItem(item)}/>
            ))}
          </div>
          <div className="mt-4 bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
            <div className="flex items-center gap-2 mb-2">
              <Repeat2 size={13} color="#FB923C"/>
              <p style={{fontSize:12,fontWeight:700,color:'#1a1560'}}>Duplicate impact</p>
            </div>
            <p style={{fontSize:12,color:'#7F77DD',lineHeight:1.6}}>
              Clearing duplicates could free ~15% of wardrobe space for new statement pieces.
            </p>
          </div>
        </div>
      )}

      {/* ── Tips ───────────────────────────────────────────── */}
      {activeSection==='tips' && (
        <div className="px-5 space-y-3 mb-5">
          <p style={{fontSize:12,color:'#AFA9EC',marginBottom:4}}>Personalised suggestions to improve your score</p>
          {TIPS.map((tip,i)=>(
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 items-start" style={{border:CARD_BORDER}}>
              <span style={{fontSize:22}}>{tip.icon}</span>
              <p style={{fontSize:13,color:'#1a1560',lineHeight:1.6,flex:1}}>{tip.text}</p>
            </div>
          ))}
          <div className="bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
            <p style={{fontSize:12,fontWeight:700,color:'#1a1560',marginBottom:12}}>Category utilization</p>
            {[{label:'Tops',pct:78,color:'#3D35A8'},{label:'Bottoms',pct:65,color:'#7F77DD'},
              {label:'Outerwear',pct:38,color:'#F87171'},{label:'Shoes',pct:72,color:'#AFA9EC'},
              {label:'Accessories',pct:24,color:'#FB923C'}
            ].map(row=>(
              <div key={row.label} className="mb-2.5">
                <div className="flex justify-between mb-1">
                  <span style={{fontSize:11,color:'#7F77DD'}}>{row.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:row.pct<50?'#F87171':'#3D35A8'}}>{row.pct}%</span>
                </div>
                <div style={{height:4,background:'#EEEDFE',borderRadius:999,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${row.pct}%`,background:row.color,borderRadius:999}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItem && <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)}/>}
    </div>
  );
}

/* ─── Main HomeTab ───────────────────────────────────────────────── */
export default function HomeTab() {
  const [showHealthDetail, setShowHealthDetail] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState(getItems());
  const [weatherSeed, setWeatherSeed] = useState(0);
  useEffect(() => subscribeWardrobe(() => setWardrobeItems(getItems())), []);

  if (showHealthDetail) return <HealthDetailView onBack={() => setShowHealthDetail(false)} wardrobeItems={wardrobeItems}/>;

  const totalItems = wardrobeItems.length;
  const typeCounts = wardrobeItems.reduce<Record<string,number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1; return acc;
  }, {});
  const typeColors: Record<string,string> = { Top:'#2D2780', Bottom:'#7F77DD', Outerwear:'#AFA9EC', Shoes:'#D4D0F5', Accessories:'#C084FC' };
  const dynamicSegments = Object.entries(typeCounts)
    .map(([label, count]) => ({ label, pct: Math.round(count / totalItems * 100), color: typeColors[label] ?? '#EEEDFE' }))
    .filter(s => s.pct > 0);

  /* Today's weather outfit — cycle through items per type using weatherSeed */
  const tops    = wardrobeItems.filter(i => i.type === 'Top');
  const bottoms = wardrobeItems.filter(i => i.type === 'Bottom');
  const shoes   = wardrobeItems.filter(i => i.type === 'Shoes');
  const weatherTop    = tops[weatherSeed    % Math.max(tops.length, 1)]    ?? wardrobeItems[0];
  const weatherBottom = bottoms[(weatherSeed+1) % Math.max(bottoms.length, 1)] ?? wardrobeItems[1];
  const weatherShoes  = shoes[(weatherSeed+2)   % Math.max(shoes.length, 1)]   ?? wardrobeItems[2];
  const weatherItems  = [weatherTop, weatherBottom, weatherShoes].filter(Boolean) as ClothingItem[];

  const IDLE_CATS = [
    { emoji:'🧥', label:'Outerwear', count:4 },
    { emoji:'👟', label:'Shoes',     count:3 },
    { emoji:'👜', label:'Accessories',count:2},
  ];

  return (
    <div className="h-full overflow-y-auto" style={{background:PAGE_BG,fontFamily:"'DM Sans',sans-serif"}}>

      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-5 relative">
        {/* Avatar — further left */}
        <div className="absolute flex items-end justify-center"
          style={{top:52,right:10,width:152,height:152,overflow:'visible',pointerEvents:'none'}}>
          <img src={avatarImg} alt="avatar"
            style={{width:'100%',height:'100%',objectFit:'contain',objectPosition:'bottom right'}}/>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span style={{fontSize:12,color:'#7F77DD',fontWeight:500}}>May 14, 2026</span>
          <Sparkles size={10} color="#AFA9EC"/>
        </div>
        <h1 style={{...TITLE_FONT,fontWeight:800,fontSize:46,lineHeight:1.05,color:'#1a1560',letterSpacing:'-0.5px'}}>
          My Closet
        </h1>
        <p style={{fontSize:14,color:'#7F77DD',marginTop:4}}>What to wear today?</p>
        <div className="flex gap-2.5 mt-4">
          {[`${totalItems} items`,'23 outfits'].map(lbl=>(
            <span key={lbl} style={{border:'1px solid #AFA9EC',borderRadius:999,
              padding:'5px 14px',fontSize:13,color:'#3D35A8',fontWeight:500,background:'white'}}>{lbl}</span>
          ))}
        </div>
      </div>

      {/* ── Today's outfit ──────────────────────────────── */}
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <p style={LABEL_STYLE}>Today's weather outfit</p>
        <button onClick={() => setWeatherSeed(s => s + 1)}
          className="flex items-center gap-1 rounded-full px-2.5 py-1"
          style={{ background:'white', border:CARD_BORDER, color:'#7F77DD' }}>
          <RefreshCw size={11} color="#7F77DD"/>
          <span style={{ fontSize:10, fontWeight:600 }}>Refresh</span>
        </button>
      </div>
      <div className="mx-5 mb-5" style={{borderRadius:22,background:'#3D35A8',padding:'20px 18px 18px'}}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{fontSize:64,fontWeight:800,color:'white',lineHeight:1,letterSpacing:'-2px'}}>22°</p>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.65)',marginTop:4}}>Melbourne · Sunny</p>
          </div>
          <div className="mt-1"><SunSVG/></div>
        </div>
        <div className="inline-flex items-center gap-2 mt-4"
          style={{background:'rgba(255,255,255,0.13)',borderRadius:999,padding:'6px 12px'}}>
          <Cloud size={12} color="rgba(255,255,255,0.7)"/>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.85)',fontWeight:500}}>Light layers, bring a jacket for evening</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {weatherItems.map((item, i) => (
            <ClothingImageTile key={i} item={item}/>
          ))}
        </div>
      </div>

      {/* ── Wardrobe overview ───────────────────────────── */}
      <SectionLabel>Wardrobe overview</SectionLabel>
      <div className="mx-5 grid grid-cols-2 gap-3 mb-6">

        {/* Type breakdown */}
        <div style={{background:'white',borderRadius:18,border:CARD_BORDER,padding:'14px 12px'}}>
          <p style={{fontSize:12,fontWeight:700,color:'#1a1560',marginBottom:6}}>Type breakdown</p>
          <div style={{width:'100%',aspectRatio:'1'}}>
            <DonutChart segments={dynamicSegments}/>
          </div>
          <div className="space-y-1.5 mt-1">
            {dynamicSegments.map(s=>(
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div style={{width:7,height:7,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                  <span style={{fontSize:10,color:'#555'}}>{s.label}</span>
                </div>
                <span style={{fontSize:10,color:'#3D35A8',fontWeight:600}}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Closet health */}
        <button onClick={()=>setShowHealthDetail(true)} className="text-left"
          style={{background:'white',borderRadius:18,border:CARD_BORDER,padding:'14px 12px',cursor:'pointer'}}>
          <div className="flex items-center justify-between mb-1.5">
            <p style={{fontSize:12,fontWeight:700,color:'#1a1560'}}>Closet health</p>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span style={{fontSize:22,fontWeight:800,color:'#FB923C',lineHeight:1}}>7</span>
            <span style={{fontSize:10,fontWeight:600,color:'#1a1560'}}>duplicates</span>
          </div>
          <p style={{fontSize:9,color:'#AFA9EC',marginTop:1}}>Consider consolidating</p>
          <HealthBar color="#FB923C" fill={28}/>

          <div className="flex items-baseline gap-1.5">
            <span style={{fontSize:22,fontWeight:800,color:'#F87171',lineHeight:1}}>12</span>
            <span style={{fontSize:10,fontWeight:600,color:'#1a1560'}}>idle items</span>
          </div>
          <p style={{fontSize:9,color:'#AFA9EC',marginTop:1}}>Unworn 90+ days</p>
          <HealthBar color="#F87171" fill={48}/>

          <p style={{fontSize:9,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:5}}>
            Idle by category
          </p>
          <div className="space-y-1.5">
            {IDLE_CATS.map(c=>(
              <div key={c.label} className="flex items-center gap-1.5">
                <span style={{fontSize:11}}>{c.emoji}</span>
                <span style={{fontSize:9,color:'#555',flex:1}}>{c.label}</span>
                <div className="flex gap-0.5">
                  {Array.from({length:c.count}).map((_,i)=>(
                    <div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#F87171'}}/>
                  ))}
                </div>
                <span style={{fontSize:9,fontWeight:700,color:'#F87171',minWidth:12,textAlign:'right'}}>{c.count}</span>
              </div>
            ))}
          </div>

          <p style={{fontSize:11,color:'#AFA9EC',marginTop:7,textAlign:'right',fontWeight:600}}>Tap for full report →</p>
        </button>
      </div>
    </div>
  );
}
