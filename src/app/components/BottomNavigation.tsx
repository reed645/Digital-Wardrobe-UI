import { Home, LayoutGrid, Sparkles, BookOpen, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'clothes', label: 'Closet',  Icon: LayoutGrid },
  { id: 'ai',      label: 'AI Rec',  Icon: Sparkles },
  { id: 'outfit',  label: 'Outfits', Icon: BookOpen },
  { id: 'profile', label: 'Me',      Icon: User },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="phone-bottom-nav">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              style={{ gap: 3 }}>
              <Icon size={21} strokeWidth={isActive ? 2 : 1.6}
                color={isActive ? 'white' : 'rgba(255,255,255,0.42)'} />
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'white' : 'rgba(255,255,255,0.42)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '-0.1px',
              }}>
                {label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: 4,
                  width: 4, height: 4, borderRadius: '50%', background: 'white',
                }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
