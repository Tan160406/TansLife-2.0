import React from 'react';
import { 
  Compass, 
  Calendar, 
  BookOpen, 
  Clock, 
  Smile, 
  FileText, 
  Target, 
  DollarSign, 
  Cpu, 
  Sparkles, 
  Volume2, 
  Layers, 
  Moon, 
  Sun,
  User,
  Award
} from 'lucide-react';
import { SystemTheme, LifeOSData } from '../types';
import { THEMES, ThemeConfig } from '../themes';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  data: LifeOSData;
  updateTheme: (theme: SystemTheme) => void;
  theme: ThemeConfig;
  currentThemeKey: SystemTheme;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  data,
  updateTheme,
  theme,
  currentThemeKey
}) => {
  const tabs = [
    { id: 'dashboard', label: 'The Dashboard', icon: Compass },
    { id: 'calendar', label: 'Smart Calendar', icon: Calendar },
    { id: 'academic', label: 'Academic Hub', icon: BookOpen },
    { id: 'productivity', label: 'Command Center', icon: Clock },
    { id: 'habits', label: 'Habits & Mood', icon: Smile },
    { id: 'goals', label: 'Goal Master', icon: Target },
    { id: 'finances', label: 'Financials', icon: DollarSign },
    { id: 'ai', label: 'AI Butler', icon: Cpu },
  ];


  return (
    <aside id="lifeos-sidebar" className={`w-full lg:w-64 p-4 lg:p-6 flex flex-col justify-between ${theme.card} rounded-3xl transition-all duration-300`}>
      <div>
        {/* User profile & XP levels */}
        <div className="flex items-center gap-3 mb-6 p-2.5 rounded-2xl bg-black/10">
          <img 
            src={data.settings.avatarUrl} 
            alt="User avatar" 
            className="w-10 h-10 rounded-full border-2 border-indigo-500/30 bg-black/20"
          />
          <div className="flex-1 overflow-hidden">
            <h2 className="font-bold text-sm truncate">{data.settings.userName}</h2>
            <p className="text-[9px] font-mono text-gray-500 mt-0.5">Active Academic Profile</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-white/15 shadow-sm scale-[1.02] text-white' 
                    : `${theme.textMuted} hover:bg-white/5 hover:text-white`
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                <span>{tab.label}</span>
                {tab.id === 'ai' && (
                  <Sparkles className="w-3 h-3 ml-auto animate-pulse text-yellow-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-white/5">
        <div className="text-[10px] font-mono text-center text-gray-500 flex items-center justify-center gap-2">
          <Award className="w-3 h-3 text-yellow-500" />
          <span>TansLife 2.0</span>
        </div>
      </div>
    </aside>
  );
};
