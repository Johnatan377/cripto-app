import React from 'react';
import { Home, PieChart, PlusCircle, Settings, BrainCircuit } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick }) => {
  return (
    <div className="min-h-screen bg-crypto-dark text-crypto-text font-sans selection:bg-crypto-accent selection:text-white pb-24">
      <header className="sticky top-0 z-50 bg-crypto-dark/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-crypto-primary to-crypto-accent flex items-center justify-center">
            <span className="font-bold text-white">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Cryptofolio</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <Settings size={20} className="text-crypto-muted" />
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-crypto-card/90 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-around items-center max-w-3xl mx-auto h-16">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home size={24} />} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')} 
            icon={<BrainCircuit size={24} />} 
            label="AI Insights" 
          />
          <div className="relative -top-6">
            <button 
              onClick={onAddClick}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-crypto-primary to-crypto-accent flex items-center justify-center shadow-lg shadow-crypto-primary/30 hover:scale-105 transition-transform"
            >
              <PlusCircle size={28} color="white" />
            </button>
          </div>
          <NavButton 
            active={activeTab === 'allocation'} 
            onClick={() => setActiveTab('allocation')} 
            icon={<PieChart size={24} />} 
            label="Allocation" 
          />
          <NavButton 
            active={false} 
            onClick={() => alert("Settings coming soon!")} 
            icon={<Settings size={24} />} 
            label="Settings" 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-16 transition-colors ${active ? 'text-crypto-primary' : 'text-crypto-muted hover:text-white'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Layout;
