import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Camera, ImageIcon, X, Sparkles, Check, ChevronLeft, Edit2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import clothingPreview from '../../imports/image.png';
import FilterSheet, { FilterState } from './FilterSheet';
import { getStyles, addStyle, subscribeStyles } from '../store/styleTags';
import { getItems, addItem as storeAddItem, updateItem as storeUpdateItem, removeItem as storeRemoveItem, subscribeWardrobe, getNextClosetId, ClothingItem, markAsWorn } from '../store/wardrobe';
import { addItemToOutfit, addItemToTodayOutfit, SavedOutfitItem, addOutfit } from '../store/outfits';
import { getCategories, getColorPalette, getSeasons, getTodayDate, getImagePath } from '../../data/index';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const PAGE_BG    = '#F8F7FF';
const CARD_BORDER = '1px solid #EEEDFE';

/* ─── Data from data layer ───────────────────────────────────────── */
const CATEGORY_TABS = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
const CATEGORY_MAP: Record<string, string[]> = {
  Tops: ['Top'], Bottoms: ['Bottom'], Outerwear: ['Outerwear'],
  Shoes: ['Shoes'], Accessories: ['Accessories'],
};

/* ─── Scan data from data layer ─────────────────────────────────── */
const SCAN_CATEGORIES = getCategories();
const SCAN_COLORS = getColorPalette();
const SCAN_SEASONS = getSeasons();

/* ─── Source sheet ───────────────────────────────────────────────── */
function SourceSheet({ onSelect, onClose }: { onSelect:(src:'camera'|'album')=>void; onClose:()=>void }) {
  return (
    <>
      <div className="absolute inset-0 bg-black/40 z-20" onClick={onClose}/>
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl" style={{padding:'16px 20px 40px'}}>
        <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full" style={{background:'#EEEDFE'}}/></div>
        <div className="flex items-center justify-between mb-5">
          <p style={{fontSize:18,fontWeight:700,color:'#1a1560',fontFamily:"'DM Sans',sans-serif"}}>Add New Item</p>
          <button onClick={onClose}><X size={20} color="#AFA9EC"/></button>
        </div>
        <div className="space-y-3">
          {[{icon:Camera,bg:'#3D35A8',label:'Take Photo',sub:'Use your camera to capture clothing',src:'camera'as const},
            {icon:ImageIcon,bg:'#7F77DD',label:'Choose from Album',sub:'Select an existing photo',src:'album'as const}
          ].map(opt=>(
            <button key={opt.src} onClick={()=>onSelect(opt.src)}
              className="w-full flex items-center gap-4 rounded-2xl p-4 text-left" style={{background:'#F0EEFF'}}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:opt.bg}}>
                <opt.icon size={22} color="white"/>
              </div>
              <div>
                <p style={{fontWeight:600,color:'#1a1560',fontSize:15}}>{opt.label}</p>
                <p style={{fontSize:12,color:'#AFA9EC',marginTop:2}}>{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Photo preview ──────────────────────────────────────────────── */
function PhotoPreview({ onConfirm, onBack }: { onConfirm:()=>void; onBack:()=>void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{background:'#000'}}>
      <div className="flex-1 relative overflow-hidden">
        <img src={clothingPreview} alt="preview" className="w-full h-full object-cover"/>
        <button onClick={onBack} className="absolute top-12 left-4 flex items-center justify-center rounded-full"
          style={{width:36,height:36,background:'rgba(0,0,0,0.5)'}}>
          <ChevronLeft size={20} color="white"/>
        </button>
      </div>
      <div className="px-5 py-6 flex gap-3" style={{background:'#000'}}>
        <button onClick={onBack} className="flex-1 h-12 rounded-full font-semibold text-sm"
          style={{background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)'}}>Retake</button>
        <button onClick={onConfirm} className="flex-1 h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
          style={{background:'#3D35A8',color:'white'}}>
          <Sparkles size={15}/> Analyse with AI
        </button>
      </div>
    </div>
  );
}

/* ─── Scanning view ──────────────────────────────────────────────── */
function ScanningView() {
  const [dot, setDot] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>setDot(d=>(d+1)%4),400); return ()=>clearInterval(t); },[]);
  const steps=['Detecting garment type…','Analysing colour palette…','Identifying style tags…','Finalising result…'];
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8" style={{background:PAGE_BG,fontFamily:"'DM Sans',sans-serif"}}>
      <div className="relative">
        <div className="w-32 h-40 rounded-2xl overflow-hidden" style={{border:'2px solid #3D35A8'}}>
          <img src={clothingPreview} className="w-full h-full object-cover" alt="scan"/>
        </div>
        <div className="absolute inset-x-0 top-0 h-0.5 rounded-full animate-bounce"
          style={{background:'linear-gradient(90deg,transparent,#3D35A8,transparent)',animationDuration:'1.5s'}}/>
        <Sparkles size={14} color="#3D35A8" className="absolute animate-pulse" style={{top:-8,left:-8}}/>
        <Sparkles size={14} color="#3D35A8" className="absolute animate-pulse" style={{top:-8,right:-8,animationDelay:'0.2s'}}/>
        <Sparkles size={14} color="#3D35A8" className="absolute animate-pulse" style={{bottom:-8,left:-8,animationDelay:'0.4s'}}/>
        <Sparkles size={14} color="#3D35A8" className="absolute animate-pulse" style={{bottom:-8,right:-8,animationDelay:'0.6s'}}/>
      </div>
      <div className="text-center px-8">
        <p style={{fontSize:16,fontWeight:700,color:'#1a1560'}}>Scanning your item</p>
        <p style={{fontSize:13,color:'#7F77DD',marginTop:6,minHeight:20}}>{steps[dot]}</p>
      </div>
      <div className="flex gap-2">
        {steps.map((_,i)=>(
          <div key={i} style={{width:i===dot?20:6,height:6,borderRadius:999,background:i===dot?'#3D35A8':'#EEEDFE',transition:'all 0.3s'}}/>
        ))}
      </div>
    </div>
  );
}

/* ─── Multi-item scan results view ────────────────────────────────── */
const WARDROBE_LOOKUP: Record<string, { type: string; color: string; name: string; emoji: string; colorHex: string; image: string }> = {
  'C023': { type: 'Top', color: 'Blue', name: 'Blue Sweater', emoji: '👕', colorHex: '#4A90D9', image: 'blue_sweater-1.png' },
  'C008': { type: 'Bottom', color: 'Beige', name: 'Beige Trousers', emoji: '👖', colorHex: '#D4BFA0', image: 'pant.png' },
  'C011': { type: 'Shoes', color: 'Black', name: 'Army Boots', emoji: '🥾', colorHex: '#1A1A1A', image: 'Black_army_Boots.png' },
  'C024': { type: 'Accessories', color: 'Tan', name: 'Shopping Bag', emoji: '👜', colorHex: '#C8A96E', image: 'Shopping_Bag-1.png' },
};

const DETECTED_ITEMS = [
  { id: 'scan_1', closetId: 'C023', ...WARDROBE_LOOKUP['C023'] },
  { id: 'scan_2', closetId: 'C008', ...WARDROBE_LOOKUP['C008'] },
  { id: 'scan_3', closetId: 'C011', ...WARDROBE_LOOKUP['C011'] },
  { id: 'scan_4', closetId: 'C024', ...WARDROBE_LOOKUP['C024'] },
];

interface MultiItemScanViewProps {
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
}

function MultiItemScanView({ onConfirm, onCancel }: MultiItemScanViewProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(DETECTED_ITEMS.map(i => i.id)));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const count = selected.size;

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden" style={{ background: PAGE_BG, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ borderBottom: CARD_BORDER, flexShrink: 0 }}>
        <button onClick={onCancel} style={{ color: '#7F77DD', fontSize: 14 }}>Cancel</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1560' }}>Detected Items</h2>
        <div style={{ width: 60 }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p style={{ fontSize: 14, color: '#AFA9EC', marginBottom: 16 }}>We found 4 items. Select which to add to your closet.</p>

        <div className="space-y-3">
          {DETECTED_ITEMS.map(item => {
            const isSelected = selected.has(item.id);
            const imgUrl = getImagePath(item.image);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left"
                style={{ background: isSelected ? '#F0EEFF' : 'white', border: CARD_BORDER }}
              >
                {/* Checkbox */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected ? '#3D35A8' : 'white',
                    border: isSelected ? 'none' : '2px solid #AFA9EC'
                  }}
                >
                  {isSelected && <Check size={13} color="white" strokeWidth={3} />}
                </div>

                {/* Image */}
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: '#F0EEFF' }}
                >
                  {imgUrl && <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" />}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#EEEDFE', color: '#3D35A8', borderRadius: 999, padding: '2px 8px' }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: 10, color: '#AFA9EC' }}>{item.color}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1560', marginTop: 4 }}>{item.name}</p>
                </div>

                {/* Color dot */}
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ background: item.colorHex, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-4 pb-8 pt-4" style={{ borderTop: CARD_BORDER, flexShrink: 0 }}>
        <button
          onClick={() => onConfirm(Array.from(selected))}
          className="w-full h-12 rounded-full font-semibold text-sm text-white"
          style={{ background: count > 0 ? '#3D35A8' : '#AFA9EC' }}
          disabled={count === 0}
        >
          Add Selected ({count} {count === 1 ? 'item' : 'items'})
        </button>
      </div>
    </div>
  );
}

/* ─── Item edit form (used both for new items and editing existing) ─ */
interface ItemFormData {
  category: string; colorNames: string[];
  styles: string[]; seasons: string[]; comment: string;
}

function ItemEditForm({ initial, onSave, onBack, title='AI Detected', itemImage }: {
  initial: ItemFormData; onSave:(d:ItemFormData)=>void; onBack:()=>void; title?:string; itemImage?:string;
}) {
  const [data, setData] = useState<ItemFormData>(initial);
  const [dynStyles, setDynStyles] = useState(getStyles());
  const [newTag,   setNewTag]   = useState('');
  useEffect(()=>subscribeStyles(()=>setDynStyles(getStyles())),[]);

  function toggleStyle(s:string) { setData(p=>({...p,styles:p.styles.includes(s)?p.styles.filter(x=>x!==s):[...p.styles,s]})); }
  function toggleSeason(s:string){ setData(p=>({...p,seasons:p.seasons.includes(s)?p.seasons.filter(x=>x!==s):[...p.seasons,s]})); }
  function toggleColor(n:string) { setData(p=>({...p,colorNames:p.colorNames.includes(n)?p.colorNames.filter(x=>x!==n):[...p.colorNames,n]})); }
  function handleAddTag() {
    const t=newTag.trim();
    if(!t) return;
    addStyle(t); // adds to global store → FilterSheet updates too
    setData(p=>({...p,styles:p.styles.includes(t)?p.styles:[...p.styles,t]}));
    setNewTag('');
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden" style={{background:PAGE_BG,fontFamily:"'DM Sans',sans-serif"}}>
      <div className="flex items-center justify-between px-4 pt-12 pb-4" style={{background:PAGE_BG}}>
        <button onClick={onBack} className="flex items-center gap-1.5" style={{color:'#7F77DD',fontSize:14,fontWeight:500}}>
          <ChevronLeft size={18}/> Back
        </button>
        <p style={{fontSize:16,fontWeight:700,color:'#1a1560',fontFamily:"'Playfair Display',serif",fontStyle:'italic'}}>{title}</p>
        <div style={{width:52}}/>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 px-4">
        {/* Photo */}
        <div className="flex justify-center mb-6">
          <div className="rounded-2xl overflow-hidden" style={{width:160,height:200,border:CARD_BORDER}}>
            <img src={itemImage ?? clothingPreview} className="w-full h-full object-cover" alt="item"/>
          </div>
        </div>
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{background:'#F0EEFF',border:'1px solid #EEEDFE'}}>
            <Sparkles size={12} color="#3D35A8"/>
            <span style={{fontSize:11,fontWeight:700,color:'#3D35A8'}}>AI analysed · tap to edit</span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Category</p>
          <div className="flex flex-wrap gap-1.5">
            {SCAN_CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setData(p=>({...p,category:c}))}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{background:data.category===c?'#3D35A8':'white',color:data.category===c?'white':'#7F77DD',border:data.category===c?'none':CARD_BORDER}}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Colours */}
        <div className="mb-4">
          <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>
            Colours{data.colorNames.length>0&&<span style={{fontSize:10,color:'#3D35A8',fontWeight:600,marginLeft:8,textTransform:'none',letterSpacing:0}}>{data.colorNames.join(', ')}</span>}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {SCAN_COLORS.map(c=>{
              const sel=data.colorNames.includes(c.name);
              return (
                <button key={c.name} onClick={()=>toggleColor(c.name)}
                  className="relative flex flex-col items-center gap-1 flex-shrink-0"
                  style={{transform:sel?'scale(1.1)':'scale(1)',transition:'transform 0.15s'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:c.hex,border:sel?'2.5px solid #3D35A8':c.light?'1.5px solid #D1D5DB':'1px solid rgba(0,0,0,0.1)'}}/>
                  {sel&&<div className="absolute inset-0 flex items-center justify-center"><Check size={12} color={c.light?'#3D35A8':'white'} strokeWidth={3}/></div>}
                  <span style={{fontSize:8,color:'#AFA9EC',fontWeight:500}}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style tags */}
        <div className="mb-4">
          <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Style Tags</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {dynStyles.map(s=>(
              <button key={s} onClick={()=>toggleStyle(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{background:data.styles.includes(s)?'#3D35A8':'white',color:data.styles.includes(s)?'white':'#7F77DD',border:data.styles.includes(s)?'none':CARD_BORDER}}>
                {s}
              </button>
            ))}
          </div>
          {/* Add custom tag */}
          <div className="flex gap-2 mt-2">
            <input value={newTag} onChange={e=>setNewTag(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleAddTag()}
              placeholder="Add custom style…"
              className="flex-1 px-3 py-2 rounded-xl outline-none text-xs"
              style={{border:CARD_BORDER,background:'white',color:'#1a1560',fontFamily:"'DM Sans',sans-serif"}}/>
            <button onClick={handleAddTag}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{background:'#3D35A8',color:'white'}}>Add</button>
          </div>
        </div>

        {/* Season */}
        <div className="mb-4">
          <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Season</p>
          <div className="grid grid-cols-4 gap-1.5">
            {SCAN_SEASONS.map(s=>(
              <button key={s} onClick={()=>toggleSeason(s)}
                className="h-8 rounded-full text-xs font-semibold transition-colors"
                style={{background:data.seasons.includes(s)?'#3D35A8':'white',color:data.seasons.includes(s)?'white':'#7F77DD',border:data.seasons.includes(s)?'none':CARD_BORDER}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>
            Comment <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:10}}>(optional)</span>
          </p>
          <input value={data.comment} onChange={e=>setData(p=>({...p,comment:e.target.value}))}
            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
            style={{border:CARD_BORDER,background:'white',color:'#1a1560',fontFamily:"'DM Sans',sans-serif"}}
            placeholder="Notes, memories, where you got it…"/>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 px-4 pb-8 pt-3" style={{background:PAGE_BG,borderTop:CARD_BORDER}}>
        <button onClick={()=>onSave(data)}
          className="w-full h-12 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2"
          style={{background:'#3D35A8'}}>
          <Check size={16}/> Save
        </button>
      </div>
    </div>
  );
}

/* ─── Item detail page ───────────────────────────────────────────── */
function ItemDetailView({ item, onBack, onEdit, onMarkWorn, forceLongAgo }: {
  item:ClothingItem; onBack:()=>void; onEdit:()=>void; onMarkWorn:()=>void; forceLongAgo?:boolean;
}) {
  const todayStr = getTodayDate();
  const getLastWornText = () => {
    if (forceLongAgo || !item.lastWorn) return '90+ days';
    const lastWornDate = new Date(item.lastWorn);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - lastWornDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 90) return '90+ days';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };
  const lastWornText = getLastWornText();
  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden" style={{background:PAGE_BG,fontFamily:"'DM Sans',sans-serif"}}>
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5" style={{color:'#7F77DD',fontSize:14,fontWeight:500}}>
          <ChevronLeft size={18}/> Back
        </button>
        <p style={{fontSize:16,fontWeight:700,color:'#1a1560',fontFamily:"'Playfair Display',serif",fontStyle:'italic'}}>Item Detail</p>
        <button onClick={onEdit} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{background:'#F0EEFF',fontSize:13,fontWeight:600,color:'#3D35A8'}}>
          <Edit2 size={13}/> Edit
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        <div className="rounded-2xl overflow-hidden mb-5" style={{aspectRatio:'3/4',border:CARD_BORDER}}>
          <img src={item.image ?? clothingPreview} className="w-full h-full object-cover" alt="item"/>
        </div>
        {/* ID + Type + Color */}
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          {item.closetId && (
            <span className="px-2.5 py-1.5 rounded-full text-sm font-bold"
              style={{background:'#EEEDFE', color:'#3D35A8', letterSpacing:'0.04em'}}>
              {item.closetId}
            </span>
          )}
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{background:'#3D35A8',color:'white'}}>{item.type}</span>
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2" style={{background:'white',border:CARD_BORDER,color:'#1a1560'}}>
            <div style={{width:12,height:12,borderRadius:'50%',background:item.colorHex,border:item.colorHex==='#F0EDE8'?'1px solid #ddd':'none',flexShrink:0}}/>
            {item.color}
          </span>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {[{label:'Times Worn',value:`${item.wearCount}×`,color:'#3D35A8',bg:'#F0EEFF'},
            {label:'Last Worn', value: lastWornText,   color:'#7F77DD',bg:'white'}
          ].map(s=>(
            <div key={s.label} className="rounded-2xl p-4" style={{background:s.bg,border:CARD_BORDER}}>
              <p style={{fontSize:10,color:'#AFA9EC',fontWeight:600}}>{s.label}</p>
              <p style={{fontSize:20,fontWeight:800,color:s.color,marginTop:2}}>{s.value}</p>
            </div>
          ))}
        </div>
        {/* Style */}
        {item.styles.length>0&&(
          <div className="mb-4">
            <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8}}>Style</p>
            <div className="flex gap-2 flex-wrap">
              {item.styles.map(s=>(
                <span key={s} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{background:'#EEEDFE',color:'#3D35A8'}}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {/* Season */}
        {item.seasons.length>0&&(
          <div className="mb-4">
            <p style={{fontSize:11,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8}}>Season</p>
            <div className="flex gap-2 flex-wrap">
              {item.seasons.map(s=>(
                <span key={s} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{background:'white',border:CARD_BORDER,color:'#7F77DD'}}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {/* Comment */}
        {item.comment&&(
          <div className="mb-5 bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
            <p style={{fontSize:10,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Comment</p>
            <p style={{fontSize:13,color:'#1a1560',lineHeight:1.6}}>{item.comment}</p>
          </div>
        )}
        <div className="mt-4">
          <button onClick={onMarkWorn} className="w-full h-11 rounded-full font-semibold text-sm text-white" style={{background:'#3D35A8'}}>Mark as Worn Today</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ClothesTab ────────────────────────────────────────────── */
type AddStep = null | 'source' | 'preview' | 'scanning' | 'multiDetect' | 'multiConfirm' | 'results' | 'outfitPrompt';

export default function ClothesTab() {
  const [allItems,       setAllItems]       = useState<ClothingItem[]>(getItems());
  useEffect(() => subscribeWardrobe(() => setAllItems(getItems())), []);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery,    setSearchQuery]     = useState('');
  const [showFilter,     setShowFilter]      = useState(false);
  const [addStep,        setAddStep]         = useState<AddStep>(null);
  const [selectedItemId, setSelectedItemId]  = useState<string|null>(null);
  const [editingItemId,  setEditingItemId]   = useState<string|null>(null);
  const [activeFilters,  setActiveFilters]   = useState<FilterState>({
    sortBy: null, colors: [], seasons: [], styles: [],
  });
  const [editMode,       setEditMode]       = useState(false);
  const [selectedEditIds, setSelectedEditIds] = useState<Set<string>>(new Set());

  /* Multi-item flow state */
  const [multiSelectedIds, setMultiSelectedIds] = useState<string[]>([]);
  const [multiConfirmIdx, setMultiConfirmIdx] = useState(0);
  const [multiSavedItems, setMultiSavedItems] = useState<SavedOutfitItem[]>([]);

  /* Scanning timer */
  useEffect(()=>{
    if(addStep!=='scanning') return;
    const t=setTimeout(()=>setAddStep('multiDetect'),2400);
    return ()=>clearTimeout(t);
  },[addStep]);

  /* Filter + sort */
  const q = searchQuery.toLowerCase();
  let items = allItems.filter(item=>{
    if(activeCategory!=='All'){ const ok=CATEGORY_MAP[activeCategory]??[]; if(!ok.includes(item.type)) return false; }
    if(q && !(
      item.type.toLowerCase().includes(q) ||
      item.color.toLowerCase().includes(q) ||
      item.comment.toLowerCase().includes(q) ||
      item.styles.some(s=>s.toLowerCase().includes(q)) ||
      item.seasons.some(s=>s.toLowerCase().includes(q))
    )) return false;
    if(activeFilters.colors.length>0 && !activeFilters.colors.includes(item.color)) return false;
    if(activeFilters.styles.length>0 && !item.styles.some(s=>activeFilters.styles.includes(s))) return false;
    if(activeFilters.seasons.length>0 && !item.seasons.some(s=>activeFilters.seasons.includes(s))) return false;
    return true;
  });
  if(activeFilters.sortBy==='most_worn')  items=[...items].sort((a,b)=>b.wearCount-a.wearCount);
  if(activeFilters.sortBy==='least_worn') items=[...items].sort((a,b)=>a.wearCount-b.wearCount);

  const totalActiveFilters=activeFilters.colors.length+activeFilters.seasons.length+activeFilters.styles.length+(activeFilters.sortBy?1:0);

  const idleItemIds = new Set([...allItems].sort((a,b)=>a.wearCount-b.wearCount).slice(0,6).map(i=>i.id));

  function handleSaveNewItem(d: ItemFormData) {
    const colorEntry = SCAN_COLORS.find(c => c.name === d.colorNames[0]);
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      closetId: getNextClosetId(),
      name: `${d.category} ${d.colorNames[0] ?? ''}`.trim(),
      type: d.category, color: d.colorNames[0] ?? 'Multi',
      colorHex: colorEntry?.hex ?? '#C084FC',
      comment: d.comment, wearCount: 0, styles: d.styles, seasons: d.seasons, emoji: '👕',
    };
    storeAddItem(newItem);
    setAddStep(null);
  }

  function handleSaveEdit(d: ItemFormData) {
    if(!editingItemId) return;
    const existing = allItems.find(i => i.id === editingItemId);
    if(!existing) return;
    const colorEntry = SCAN_COLORS.find(c => c.name === d.colorNames[0]);
    const updated: ClothingItem = { ...existing, type:d.category, styles:d.styles, seasons:d.seasons, comment:d.comment,
      color:d.colorNames[0] ?? existing.color,
      colorHex: colorEntry?.hex ?? existing.colorHex };
    storeUpdateItem(updated);
    setEditingItemId(null);
    setSelectedItemId(null);
  }

  const selectedItem = allItems.find(i=>i.id===selectedItemId);
  const editingItem  = allItems.find(i=>i.id===editingItemId);

  return (
    <div className="h-full relative overflow-hidden">
      <div className="h-full overflow-y-auto pb-20" style={{background:PAGE_BG}}>
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-[#EEEDFE]" style={{background:PAGE_BG}}>
          <div className="px-4 pt-4 pb-3">
            <h1 className="mb-3" style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic',fontWeight:800,fontSize:30,color:'#1a1560',lineHeight:1.1}}>My Closet</h1>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="Search type, colour, style…" value={searchQuery}
                  onChange={e=>setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                  style={{border:'1px solid #EEEDFE',background:'white',color:'#1a1560'}}/>
              </div>
              <button onClick={()=>setShowFilter(true)} className="relative px-3 rounded-xl border transition-colors flex items-center"
                style={{background:totalActiveFilters>0?'#3D35A8':'white',borderColor:totalActiveFilters>0?'#3D35A8':'#EEEDFE'}}>
                <Filter size={20} color={totalActiveFilters>0?'white':'#9CA3AF'}/>
                {totalActiveFilters>0&&(
                  <span className="absolute -top-1.5 -right-1.5 bg-[#A78BFA] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">{totalActiveFilters}</span>
                )}
              </button>
              <button onClick={()=>{ setEditMode(true); setSelectedEditIds(new Set()); }}
                className="px-3 rounded-xl border flex items-center"
                style={{background:'white',borderColor:'#EEEDFE'}}>
                <Pencil size={20} color="#7F77DD"/>
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide">
            {CATEGORY_TABS.map(cat=>(
              <button key={cat} onClick={()=>setActiveCategory(cat)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{background:activeCategory===cat?'#3D35A8':'white',color:activeCategory===cat?'white':'#7F77DD',border:activeCategory===cat?'none':CARD_BORDER}}>
                {cat}
              </button>
            ))}
          </div>
          {totalActiveFilters>0&&(
            <div className="flex gap-2 px-4 pb-3 flex-wrap">
              {activeFilters.sortBy&&<span className="rounded-full px-2.5 py-1 text-xs" style={{background:'#F0EEFF',border:'1px solid #3D35A8',color:'#3D35A8'}}>{activeFilters.sortBy==='most_worn'?'Most worn':'Least worn'}</span>}
              {[...activeFilters.colors,...activeFilters.seasons,...activeFilters.styles].map(tag=>(
                <span key={tag} className="rounded-full px-2.5 py-1 text-xs" style={{background:'#F0EEFF',border:'1px solid #3D35A8',color:'#3D35A8'}}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5">
          <p style={{fontSize:12,color:'#AFA9EC',fontWeight:500}}>{items.length} item{items.length!==1?'s':''}</p>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {items.map(item=>{
              const isChecked = selectedEditIds.has(item.id);
              return (
                <button key={item.id}
                  onClick={()=>{
                    if(editMode){
                      setSelectedEditIds(prev=>{
                        const next=new Set(prev);
                        next.has(item.id)?next.delete(item.id):next.add(item.id);
                        return next;
                      });
                    } else {
                      setSelectedItemId(item.id);
                    }
                  }}
                  className="rounded-xl overflow-hidden relative text-left" style={{aspectRatio:'3/4',background:'#EEEDFE'}}>
                  <img src={item.image ?? clothingPreview} alt="" className="w-full h-full object-cover"/>
                  {/* Closet ID badge — top-left */}
                  {item.closetId && (
                    <div className="absolute top-1.5 left-1.5">
                      <span style={{
                        background:'#EEEDFE', color:'#3D35A8',
                        fontSize:8, fontWeight:700, lineHeight:1.4,
                        borderRadius:999, padding:'1px 5px',
                        boxShadow:'0 1px 4px rgba(0,0,0,0.18)',
                      }}>
                        {item.closetId}
                      </span>
                    </div>
                  )}
                  {/* Category badge — bottom-left */}
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="rounded-full px-1.5 py-0.5" style={{background:'rgba(0,0,0,0.45)',color:'white',fontSize:9,fontWeight:600,lineHeight:1.4}}>
                      {item.type}
                    </span>
                  </div>
                  {/* Edit mode: selection overlay */}
                  {editMode && (
                    <div className="absolute inset-0" style={{background:isChecked?'rgba(61,53,168,0.25)':'rgba(0,0,0,0.05)'}}>
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{background:isChecked?'#3D35A8':'white',border:isChecked?'none':'2px solid #AFA9EC',boxShadow:'0 1px 4px rgba(0,0,0,0.15)'}}>
                        {isChecked && <Check size={13} color="white" strokeWidth={3}/>}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {items.length===0&&(
            <div className="flex flex-col items-center justify-center py-16" style={{color:'#AFA9EC'}}>
              <p style={{fontSize:14,fontWeight:500}}>No items found</p>
              <p style={{fontSize:12,marginTop:4}}>Try a different search or filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter sheet */}
      {showFilter&&(
        <FilterSheet onClose={()=>setShowFilter(false)} onApply={f=>{setActiveFilters(f);setShowFilter(false);}} initialFilters={activeFilters}/>
      )}

      {/* Add flow */}
      {addStep==='source'&&<SourceSheet onSelect={()=>setAddStep('preview')} onClose={()=>setAddStep(null)}/>}
      {addStep==='preview'&&<PhotoPreview onConfirm={()=>setAddStep('scanning')} onBack={()=>setAddStep('source')}/>}
      {addStep==='scanning'&&<ScanningView/>}
      {addStep==='multiDetect'&&(
        <MultiItemScanView
          onConfirm={(ids) => {
            setMultiSelectedIds(ids);
            setMultiConfirmIdx(0);
            setMultiSavedItems([]);
            setAddStep('multiConfirm');
          }}
          onCancel={()=>setAddStep(null)}
        />
      )}
      {addStep==='multiConfirm'&&multiConfirmIdx < multiSelectedIds.length&&(
        (() => {
          const itemId = multiSelectedIds[multiConfirmIdx];
          const detectedItem = DETECTED_ITEMS.find(i => i.id === itemId)!;
          return (
            <ItemEditForm
              key={`multi-${itemId}`}
              initial={{
                category: detectedItem.type,
                colorNames: [detectedItem.color],
                styles: ['Casual'],
                seasons: ['Spring'],
                comment: ''
              }}
              itemImage={getImagePath(detectedItem.image)}
              onSave={(d) => {
                const savedItem: SavedOutfitItem = {
                  id: `scan_${detectedItem.closetId}`,
                  type: d.category,
                  emoji: detectedItem.emoji,
                  color: d.colorNames[0] ?? detectedItem.color,
                  colorHex: detectedItem.colorHex,
                  image: detectedItem.image,
                  name: `${d.category} ${d.colorNames[0] ?? ''}`.trim(),
                };
                setMultiSavedItems(prev => [...prev, savedItem]);
                const nextIdx = multiConfirmIdx + 1;
                if (nextIdx < multiSelectedIds.length) {
                  setMultiConfirmIdx(nextIdx);
                } else {
                  setAddStep('outfitPrompt');
                }
              }}
              onBack={() => setAddStep('multiDetect')}
              title={`Confirm Item ${multiConfirmIdx + 1} of ${multiSelectedIds.length}`}
            />
          );
        })()
      )}
      {addStep==='outfitPrompt'&&multiSavedItems.length > 0&&(
        <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-80 rounded-2xl p-6 bg-white" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1560', marginBottom: 8 }}>Add these as an outfit?</h3>
            <p style={{ fontSize: 14, color: '#7F77DD', marginBottom: 20 }}>
              You've added {multiSavedItems.length} items. Would you like to save them together as an outfit?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.success("Items added to closet");
                  setAddStep(null);
                  setMultiSavedItems([]);
                }}
                className="flex-1 h-11 rounded-full font-semibold text-sm"
                style={{ background: 'transparent', color: '#7F77DD' }}
              >
                Skip
              </button>
              <button
                onClick={() => {
                  toast.success("Outfit saved");
                  setAddStep(null);
                  setMultiSavedItems([]);
                }}
                className="flex-1 h-11 rounded-full font-semibold text-sm text-white"
                style={{ background: '#3D35A8' }}
              >
                Save as outfit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item detail */}
      {selectedItemId&&selectedItem&&!editingItemId&&(
        <ItemDetailView 
          item={selectedItem} 
          onBack={()=>setSelectedItemId(null)}
          onEdit={()=>setEditingItemId(selectedItem.id)}
          onMarkWorn={() => {
            markAsWorn(selectedItem.id, getTodayDate());
            toast.success("Marked as worn today");
          }}
          forceLongAgo={idleItemIds.has(selectedItem.id)}/>
      )}

      {/* Item edit */}
      {editingItemId&&editingItem&&(
        <ItemEditForm
          initial={{category:editingItem.type,colorNames:[editingItem.color],styles:editingItem.styles,seasons:editingItem.seasons,comment:editingItem.comment}}
          onSave={handleSaveEdit} onBack={()=>setEditingItemId(null)} title="Edit Item"
          itemImage={editingItem.image}/>
      )}

      {/* FAB */}
      {addStep===null&&!selectedItemId&&!editingItemId&&!editMode&&(
        <button onClick={()=>setAddStep('source')} className="absolute bottom-20 right-4 text-white rounded-full p-4 z-10" style={{background:'#3D35A8'}}>
          <Plus size={28}/>
        </button>
      )}

      {/* Edit mode bottom bar */}
      {editMode && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3"
          style={{background:'white',borderTop:'1px solid #EEEDFE',boxShadow:'0 -4px 20px rgba(0,0,0,0.08)'}}>
          <div className="flex items-center justify-between mb-2.5">
            <p style={{fontSize:13,color:'#AFA9EC',fontWeight:500}}>
              {selectedEditIds.size} selected
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>{ setEditMode(false); setSelectedEditIds(new Set()); }}
              className="flex-1 h-12 rounded-full font-semibold text-sm"
              style={{background:'#F0EEFF',color:'#3D35A8'}}>
              Cancel
            </button>
            <button
              onClick={()=>{
                selectedEditIds.forEach(id => storeRemoveItem(id));
                setEditMode(false);
                setSelectedEditIds(new Set());
              }}
              disabled={selectedEditIds.size === 0}
              className="flex-1 h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
              style={{background:selectedEditIds.size>0?'#EF4444':'#FECACA',color:'white'}}>
              <Trash2 size={15}/> Delete ({selectedEditIds.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
