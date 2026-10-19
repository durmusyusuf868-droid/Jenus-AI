import React from 'react';
import { MessageSquare, Shield, Users, WifiOff, Code2 } from 'lucide-react';

export type ActiveTab = 'chat' | 'privacy' | 'profiles' | 'offline' | 'opensource';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chat' as ActiveTab, label: 'Sohbet', icon: MessageSquare },
    { id: 'privacy' as ActiveTab, label: 'Gizlilik', icon: Shield },
    { id: 'profiles' as ActiveTab, label: 'Profiller', icon: Users },
    { id: 'offline' as ActiveTab, label: 'Çevrimdışı', icon: WifiOff },
    { id: 'opensource' as ActiveTab, label: 'Açık Kaynak', icon: Code2 },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
