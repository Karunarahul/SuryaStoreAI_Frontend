import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Bot, 
  MoreHorizontal,
  Cpu,
  GitBranch,
  Sliders,
  X
} from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';
import type { ActiveTab } from '../../store/useSuryaStore';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSuryaStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flow' as ActiveTab, label: 'Flow', icon: Activity },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'assistant' as ActiveTab, label: 'Assistant', icon: Bot },
  ];

  const secondaryTabs = [
    { id: 'status' as ActiveTab, label: 'System Status', icon: Cpu },
    { id: 'ai-management' as ActiveTab, label: 'AI Management', icon: GitBranch },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden" onClick={() => setDrawerOpen(false)}>
          <div 
            className="absolute bottom-16 left-0 right-0 bg-[#0E1114] border-t border-[#1E232A] p-4 rounded-t-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E232A]">
              <span className="text-xs font-mono font-semibold text-text-muted uppercase">System Navigation</span>
              <button onClick={() => setDrawerOpen(false)} className="text-text-muted hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center ${
                      isActive 
                        ? 'bg-[#181D23] border-amber-500/50 text-amber-400' 
                        : 'bg-[#14181C] border-[#1E232A] text-text-secondary hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0E1114] border-t border-[#1E232A] h-14 flex items-center justify-around px-2 md:hidden">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-1 text-[10px] transition-colors ${
                isActive ? 'text-amber-400 font-medium' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex flex-col items-center justify-center w-full py-1 text-[10px] transition-colors ${
            secondaryTabs.some(t => t.id === activeTab) ? 'text-amber-400 font-medium' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </div>
    </>
  );
};
