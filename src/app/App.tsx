import { useState } from 'react';
import { Toaster } from 'sonner';
import BottomNavigation from './components/BottomNavigation';
import HomeTab from './components/HomeTab';
import ClothesTab from './components/ClothesTab';
import AITab from './components/AITab';
import OutfitTab from './components/OutfitTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'clothes':
        return <ClothesTab />;
      case 'ai':
        return <AITab onNavigate={setActiveTab} />;
      case 'outfit':
        return <OutfitTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="phone-app-layout">
        <div className="phone-app-content">
          {renderActiveTab()}
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}