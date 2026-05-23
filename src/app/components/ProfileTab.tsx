import React, { useState } from 'react';
import { Settings, Bell, Lock, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getUserProfile, getBodyTypes } from '../../data/index';

/* ─── Model images (uploaded body-type photos) ───────────────────── */
// Body type images are loaded via getBodyTypes() with resolved URLs

/* ─── Tokens ─────────────────────────────────────────────────────── */
const PAGE_BG     = '#F8F7FF';
const CARD_BORDER = '1px solid #EEEDFE';
const DM          = { fontFamily:"'DM Sans',sans-serif" };
const LABEL_STYLE = { fontSize:11, color:'#AFA9EC', fontWeight:600 as const, letterSpacing:'0.08em', textTransform:'uppercase' as const };

/* ─── Data from data layer ────────────────────────────────────────── */
const userProfile = getUserProfile();
const bodyTypes = getBodyTypes();

/* ─── Section label ──────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-5 mb-2.5"><p style={LABEL_STYLE}>{children}</p></div>;
}

/* ─── Settings row ───────────────────────────────────────────────── */
function SettingsRow({ icon:Icon, label, sub, last=false, onClick }:{
  icon:React.ElementType; label:string; sub?:string; last?:boolean; onClick?:()=>void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3.5"
      style={{borderBottom:last?'none':CARD_BORDER}}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'#EEEDFE'}}>
          <Icon size={16} color="#3D35A8"/>
        </div>
        <div className="text-left">
          <p style={{fontSize:14,fontWeight:600,color:'#1a1560',...DM}}>{label}</p>
          {sub&&<p style={{fontSize:11,color:'#AFA9EC',marginTop:1}}>{sub}</p>}
        </div>
      </div>
      <ChevronRight size={16} color="#AFA9EC"/>
    </button>
  );
}

/* ─── Measurement input ──────────────────────────────────────────── */
function MeasureInput({ label, value, unit, onChange }:{
  label:string; value:string; unit:string; onChange:(v:string)=>void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
      <p style={{fontSize:10,color:'#AFA9EC',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <input type="number" value={value}
          onChange={e=>onChange(e.target.value)}
          className="flex-1 outline-none text-xl font-bold min-w-0"
          style={{color:'#1a1560',background:'transparent',fontFamily:"'DM Sans',sans-serif"}}/>
        <span style={{fontSize:13,color:'#AFA9EC',fontWeight:500}}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── Main ProfileTab ────────────────────────────────────────────── */
export default function ProfileTab() {
  const [activeTab,    setActiveTab]    = useState<'avatar'|'settings'>('avatar');
  const [bodyType,     setBodyType]     = useState(userProfile.bodyType);
  const [height,       setHeight]       = useState(userProfile.measurements.height);
  const [bust,         setBust]         = useState(userProfile.measurements.bust);
  const [waist,        setWaist]        = useState(userProfile.measurements.waist);
  const [hips,         setHips]         = useState(userProfile.measurements.hips);

  const selectedBodyType = bodyTypes.find(b => b.key === bodyType) ?? bodyTypes[0];

  return (
    <div className="h-full overflow-y-auto" style={{background:PAGE_BG,...DM}}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-5">
        <p style={LABEL_STYLE}>Profile</p>
        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontStyle:'italic',
          fontWeight:800,fontSize:40,lineHeight:1.05,color:'#1a1560',letterSpacing:'-0.5px',marginTop:4}}>
          {userProfile.name}
        </h1>
        <p style={{fontSize:13,color:'#7F77DD',marginTop:4}}>{userProfile.email}</p>
        <div className="flex gap-2.5 mt-4">
          {['24 items','3 outfits','Jan 2026'].map(lbl=>(
            <span key={lbl} style={{border:'1px solid #AFA9EC',borderRadius:999,
              padding:'5px 12px',fontSize:12,color:'#3D35A8',fontWeight:500,background:'white'}}>
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* ── Avatar / Settings tabs ─────────────────────────── */}
      <div className="flex gap-2 px-5 mb-4">
        {(['avatar','settings'] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            className="flex-1 h-9 rounded-full text-sm font-semibold transition-colors"
            style={{background:activeTab===t?'#3D35A8':'white',
              color:activeTab===t?'white':'#7F77DD',
              border:activeTab===t?'none':CARD_BORDER}}>
            {t==='avatar'?'My Avatar':'Settings'}
          </button>
        ))}
      </div>

      {activeTab==='avatar' && (
        <>
          {/* ── Avatar preview + controls ──────────────────── */}
          <div className="mx-5 mb-5 bg-white rounded-2xl overflow-hidden" style={{border:CARD_BORDER}}>
            <div className="flex">

              {/* Model photo area */}
              <div className="flex-shrink-0 flex items-end justify-center"
                style={{width:150, height:220, background:'white', position:'relative', overflow:'hidden'}}>
                <img
                  key={selectedBodyType.key}
                  src={selectedBodyType.imageUrl ?? selectedBodyType.image}
                  alt={selectedBodyType.label}
                  style={{
                    position:'absolute', inset:0,
                    width:'100%', height:'100%',
                    objectFit:'contain',
                    objectPosition:'center bottom',
                    transition:'opacity 0.2s ease',
                  }}
                />
              </div>

              {/* Quick controls */}
              <div className="flex-1 py-4 pr-4 pl-1 space-y-4">

                {/* Body type */}
                <div>
                  <p style={{fontSize:10,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>
                    Body Type
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {bodyTypes.map(b=>(
                      <button key={b.key} onClick={()=>setBodyType(b.key)}
                        className="h-7 px-2 rounded-lg text-xs font-semibold text-left transition-colors"
                        style={{
                          background: bodyType===b.key ? '#3D35A8' : '#F0EEFF',
                          color:      bodyType===b.key ? 'white'   : '#7F77DD',
                        }}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Selected body type label */}
            <div className="px-4 py-2 flex items-center gap-2" style={{borderTop:CARD_BORDER, background:'#F8F7FF'}}>
              <span style={{fontSize:10,fontWeight:700,color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                Body Type:
              </span>
              <span style={{fontSize:12,fontWeight:700,color:'#3D35A8'}}>{selectedBodyType.label}</span>
            </div>

          </div>

          {/* ── Body measurements ──────────────────────────── */}
          <SectionLabel>Body measurements</SectionLabel>
          <div className="mx-5 mb-5 grid grid-cols-2 gap-2.5">
            <MeasureInput label="Height" value={height} unit="cm" onChange={setHeight}/>
            <MeasureInput label="Bust"   value={bust}   unit="cm" onChange={setBust}/>
            <MeasureInput label="Waist"  value={waist}  unit="cm" onChange={setWaist}/>
            <MeasureInput label="Hips"   value={hips}   unit="cm" onChange={setHips}/>
          </div>

          {/* Style preferences */}
          <SectionLabel>Style preferences</SectionLabel>
          <div className="mx-5 mb-5 bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
            <div className="flex flex-wrap gap-2">
              {userProfile.stylePreferences.map(s=>(
                <span key={s} className="rounded-full px-3 py-1.5 text-sm font-semibold"
                  style={{background:'#EEEDFE',color:'#3D35A8'}}>{s}</span>
              ))}
              <button onClick={() => toast("Edit coming soon")} className="rounded-full px-3 py-1.5 text-sm font-semibold"
                style={{border:'1.5px dashed #AFA9EC',color:'#AFA9EC'}}>+ Edit</button>
            </div>
          </div>
        </>
      )}

      {activeTab==='settings' && (
        <>
          {/* Settings */}
          <SectionLabel>Settings</SectionLabel>
          <div className="mx-5 mb-5 bg-white rounded-2xl overflow-hidden" style={{border:CARD_BORDER}}>
            <SettingsRow icon={Bell}       label="Notifications"      sub="Daily outfit reminder on" onClick={() => toast("Settings coming soon")}/>
            <SettingsRow icon={Settings}   label="General Settings"   sub="App preferences" onClick={() => toast("Settings coming soon")}/>
            <SettingsRow icon={Lock}       label="Privacy & Security" sub="Data & permissions" onClick={() => toast("Settings coming soon")}/>
            <SettingsRow icon={HelpCircle} label="Help & Support"     sub="FAQ, contact us" last onClick={() => toast("Settings coming soon")}/>
          </div>

          {/* App info */}
          <SectionLabel>App info</SectionLabel>
          <div className="mx-5 mb-5 bg-white rounded-2xl p-4" style={{border:CARD_BORDER}}>
            {[{label:'Version',value:'1.0.0'},{label:'Total Items',value:'84'},
              {label:'Outfits Created',value:'23'},{label:'Member Since',value:'Jan 2026'}
            ].map((row,i,arr)=>(
              <div key={row.label} className="flex justify-between items-center py-2.5"
                style={{borderBottom:i<arr.length-1?CARD_BORDER:'none'}}>
                <span style={{fontSize:13,color:'#7F77DD'}}>{row.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:'#1a1560'}}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Log out */}
          <div className="mx-5 mb-5">
            <button onClick={() => toast.success("Logged out")} className="w-full flex items-center justify-center gap-2 rounded-full py-3"
              style={{border:'1.5px solid #FCA5A5',color:'#EF4444',background:'white',fontSize:14,fontWeight:600}}>
              <LogOut size={16}/> Log Out
            </button>
          </div>
        </>
      )}

      <p className="text-center pb-6" style={{fontSize:11,color:'#AFA9EC'}}>
        Smart Wardrobe · Group H · INFO90010
      </p>
    </div>
  );
}
