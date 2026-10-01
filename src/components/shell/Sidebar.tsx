import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Cpu, 
  GitBranch, 
  Bot, 
  Sliders, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  FlaskConical
} from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';
import type { ActiveTab } from '../../store/useSuryaStore';
import type { SystemConfig } from '../../types/suryaStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, simState, setScenario } = useSuryaStore();

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'flow' as ActiveTab, label: 'Energy Flow', icon: Activity },
        { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'status' as ActiveTab, label: 'System Status', icon: Cpu },
        { id: 'ai-management' as ActiveTab, label: 'AI Pipeline', icon: GitBranch },
      ]
    },
    {
      label: 'ASSIST',
      items: [
        { id: 'assistant' as ActiveTab, label: 'AI Assistant', icon: Bot },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0E1114] border-r border-[#1E232A] flex flex-col justify-between shrink-0 select-none hidden md:flex">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#1E232A]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Zap className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-base">SURYASTORE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">AI</span>
              </div>
              <p className="text-[11px] text-text-muted">Energy Operating System</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="px-3 text-[10px] font-mono font-semibold text-text-muted tracking-wider uppercase mb-2">
                {group.label}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all duration-150 group ${
                        isActive
                          ? 'bg-[#181D23] text-white font-medium border-l-2 border-amber-500 shadow-subtle'
                          : 'text-text-secondary hover:text-text-primary hover:bg-[#14181C]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-amber-400' : 'text-text-muted group-hover:text-text-secondary'
                        }`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Simulation Scenario Selector & Settings */}
      <div className="p-3 border-t border-[#1E232A] space-y-3 bg-[#0A0D10]">
        {/* Scenario preset selector */}
        <div className="px-2 pt-1">
          <div className="flex items-center space-x-1.5 mb-1.5 text-[10px] font-mono text-text-muted uppercase tracking-wider">
            <FlaskConical className="w-3 h-3 text-cyan-400" />
            <span>Bench Scenario Sim</span>
          </div>
          <select
            value={simState.scenario}
            onChange={(e) => setScenario(e.target.value as SystemConfig['simulatedScenario'])}
            className="w-full bg-[#14181C] text-text-primary border border-[#262C34] rounded px-2 py-1.5 text-[11px] font-sans focus:border-amber-500/60 focus:outline-none"
          >
            <option value="normal_day">Normal Diurnal Cycle</option>
            <option value="peak_solar">Peak Solar Surplus</option>
            <option value="cloud_cover">Cloud Cover Deficit</option>
            <option value="night_discharge">Night Battery Discharge</option>
            <option value="grid_outage">Grid Islanded Mode</option>
            <option value="sensor_fault">Sensor Diagnostic Fault</option>
          </select>
        </div>

        {/* Bench prototype badge */}
        <div className="mx-2 p-2 rounded bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/80 flex items-start space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>Low-Voltage 48V Bench Prototype</span>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#181D23] text-white font-medium border-l-2 border-amber-500'
              : 'text-text-secondary hover:text-text-primary hover:bg-[#14181C]'
          }`}
        >
          <Sliders className="w-4 h-4 text-text-muted" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};
