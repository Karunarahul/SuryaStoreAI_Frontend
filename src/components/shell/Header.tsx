import React from 'react';
import { 
  Play, 
  Pause, 
  Clock
} from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    status, 
    simState, 
    toggleSystemMode, 
    isSimulating, 
    setSimulating, 
    config, 
    updateConfig
  } = useSuryaStore();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Operational Dashboard';
      case 'flow': return 'Live System Topology';
      case 'analytics': return 'Energy Analytics & Efficiency';
      case 'status': return 'Hardware & Sensor Console';
      case 'ai-management': return 'AI Pipeline (Predict → Decide → Control)';
      case 'assistant': return 'SuryaStore AI Assistant';
      case 'settings': return 'System Parameters & Configurations';
      default: return 'SuryaStore AI';
    }
  };

  const formattedHours = Math.floor(simState.timeOfDayHours);
  const formattedMinutes = Math.floor((simState.timeOfDayHours % 1) * 60);
  const simClockStr = `${formattedHours.toString().padStart(2, '0')}:${formattedMinutes.toString().padStart(2, '0')}`;

  return (
    <header className="h-14 bg-[#0E1114] border-b border-[#1E232A] px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* Left Title & System Badge */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-sm md:text-base font-semibold text-text-primary tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {/* ESP32 Status Tag */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#14181C] border border-[#232931] text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">ESP32 ONLINE</span>
          </div>
          <span className="text-[#3A424D]">|</span>
          <span className="text-text-secondary">{status.esp32.ip}</span>
          <span className="text-[#3A424D]">|</span>
          <span className="text-text-muted">{status.esp32.rssi} dBm</span>
        </div>
      </div>

      {/* Right Controls: Auto/Manual Mode + Sim Controls + Clock */}
      <div className="flex items-center space-x-3">
        {/* Mode Toggle Button */}
        <button
          onClick={toggleSystemMode}
          className={`flex items-center space-x-2 px-2.5 py-1 rounded border text-xs font-mono transition-colors ${
            simState.isAutoMode
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15'
          }`}
          title="Toggle between AI Automated Optimization and Manual Relay Override"
        >
          <span className="text-[10px] text-text-muted">MODE:</span>
          <span className="font-semibold">{simState.isAutoMode ? 'AUTO (AI)' : 'MANUAL'}</span>
        </button>

        {/* Simulation Speed & Pause/Play */}
        <div className="hidden lg:flex items-center space-x-1 bg-[#14181C] border border-[#232931] rounded p-0.5">
          <button
            onClick={() => setSimulating(!isSimulating)}
            className="p-1 hover:bg-[#1E242C] rounded text-text-secondary hover:text-white transition-colors"
            title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          
          {(['realtime', '10x', '60x'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => updateConfig({ simulationSpeed: spd })}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                config.simulationSpeed === spd
                  ? 'bg-[#262E37] text-white font-medium'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {spd === 'realtime' ? '1x' : spd}
            </button>
          ))}
        </div>

        {/* Simulated Diurnal Clock */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#14181C] border border-[#232931] text-[11px] font-mono text-text-secondary">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIM: {simClockStr}</span>
        </div>
      </div>
    </header>
  );
};
