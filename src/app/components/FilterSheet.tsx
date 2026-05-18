import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStyles, subscribeStyles } from '../store/styleTags';
import { getColorPalette, getSeasons } from '../../data/index';

/* ─── Types ──────────────────────────────────────────────────────── */
export type SortBy = 'most_worn' | 'least_worn' | null;

export interface FilterState {
  sortBy: SortBy;
  colors: string[];
  seasons: string[];
  styles: string[];
}

/* ─── Data from data layer ────────────────────────────────────────── */
const COLORS = getColorPalette();
const SEASONS = getSeasons();
const STYLES = getStyles();

/* ─── Grid chip (fills cell evenly) ─────────────────────────────── */
function GridChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full h-8 rounded-full text-xs font-semibold text-center transition-colors ${
        active ? 'bg-[#6C5CE7] text-white' : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────── */
function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
interface FilterSheetProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export default function FilterSheet({ onClose, onApply, initialFilters }: FilterSheetProps) {
  const [f, setF] = useState<FilterState>(
    initialFilters ?? { sortBy: null, colors: [], seasons: [], styles: [] }
  );
  const [dynamicStyles, setDynamicStyles] = useState(getStyles());
  useEffect(() => subscribeStyles(() => setDynamicStyles(getStyles())), []);

  function toggleList(key: 'colors' | 'seasons' | 'styles', val: string) {
    setF((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  }
  function toggleSort(val: 'most_worn' | 'least_worn') {
    setF((prev) => ({ ...prev, sortBy: prev.sortBy === val ? null : val }));
  }
  function clearAll() { setF({ sortBy: null, colors: [], seasons: [], styles: [] }); }

  const activeCount = f.colors.length + f.seasons.length + f.styles.length + (f.sortBy ? 1 : 0);

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 z-20" onClick={onClose} />

      {/* Sheet — auto height, max 90% */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl overflow-hidden"
        style={{ maxHeight: '90%', background: '#F8F7FF' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-purple-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0">
          <span className="text-base font-bold text-gray-900">Filter</span>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-[#6C5CE7] font-semibold">
                Clear all
              </button>
            )}
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="h-px bg-purple-100 mx-4 flex-shrink-0" />

        {/* Scrollable body */}
        <div className="overflow-y-auto px-4 py-3 space-y-4">

          {/* Sort by */}
          <Sec title="Sort by">
            <div className="grid grid-cols-2 gap-2">
              {(['most_worn', 'least_worn'] as const).map((val) => (
                <button key={val} onClick={() => toggleSort(val)}
                  className={`h-9 rounded-xl text-xs font-semibold transition-colors ${
                    f.sortBy === val ? 'bg-[#6C5CE7] text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}>
                  {val === 'most_worn' ? 'Most worn' : 'Least worn'}
                </button>
              ))}
            </div>
          </Sec>

          {/* Color — 4-column grid */}
          <Sec title="Color">
            <div className="grid grid-cols-4 gap-1.5">
              {COLORS.map((c) => {
                const active = f.colors.includes(c.name);
                return (
                  <button key={c.name} onClick={() => toggleList('colors', c.name)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                      active ? 'bg-[#EDE9FE] ring-1 ring-[#6C5CE7]' : 'bg-white border border-gray-200'
                    }`}>
                    <div className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: c.hex, border: c.light ? '1.5px solid #D1D5DB' : 'none' }} />
                    <span className={`text-[9px] font-semibold leading-none ${active ? 'text-[#6C5CE7]' : 'text-gray-500'}`}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Sec>

          {/* Season — 4-column grid (one row) */}
          <Sec title="Season">
            <div className="grid grid-cols-4 gap-1.5">
              {SEASONS.map((s) => (
                <GridChip key={s} label={s} active={f.seasons.includes(s)} onToggle={() => toggleList('seasons', s)} />
              ))}
            </div>
          </Sec>

          {/* Style — 4-column grid (two rows) */}
          <Sec title="Style">
            <div className="grid grid-cols-4 gap-1.5">
              {dynamicStyles.map((s) => (
                <GridChip key={s} label={s} active={f.styles.includes(s)} onToggle={() => toggleList('styles', s)} />
              ))}
            </div>
          </Sec>

        </div>

        {/* Action bar */}
        <div className="px-4 pt-3 pb-8 bg-white border-t border-purple-100 flex-shrink-0">
          <button onClick={() => onApply(f)}
            className="w-full h-11 rounded-full bg-[#6C5CE7] text-white font-semibold text-sm">
            {activeCount === 0 ? 'Apply' : `Apply · ${activeCount} selected`}
          </button>
        </div>
      </div>
    </>
  );
}