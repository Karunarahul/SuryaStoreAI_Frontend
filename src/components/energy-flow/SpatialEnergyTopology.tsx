import React, { useState } from 'react';
import { Sun, BatteryCharging, Home, Zap, Play, Pause } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';
import { TopologyNodeInspector } from './TopologyNodeInspector';

interface SpatialEnergyTopologyProps {
  isFullScreenView?: boolean;
}

export const SpatialEnergyTopology: React.FC<SpatialEnergyTopologyProps> = ({ isFullScreenView = false }) => {
  const { telemetry, setSelectedTopologyNode } = useSuryaStore();
  const { solar, battery, load, grid } = telemetry;
  
  const [animateParticles, setAnimateParticles] = useState(true);

  // Active path wattage calculations
  const solarToHomeW = Math.min(solar.powerW, load.powerW);
  const solarToBatteryW = battery.state === 'charging' ? Math.min(solar.powerW, battery.powerW) : 0;
  const batteryToHomeW = battery.state === 'discharging' ? Math.min(battery.powerW, load.powerW) : 0;
  const gridToHomeW = grid.mode === 'import' ? grid.powerW : 0;

  const formatKW = (powerW: number) => (powerW / 1000).toFixed(2);

  return (
    <div className={`bg-[#0E1114] border border-[#1E232A] rounded-lg p-4 md:p-6 flex flex-col justify-between relative overflow-hidden select-none ${
      isFullScreenView ? 'min-h-[600px] h-full' : 'min-h-[380px]'
    }`}>
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none"></div>

      {/* Header bar of topology canvas */}
      <div className="flex items-center justify-between z-10 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-text-primary tracking-wider uppercase">
              Spatial Energy Topology
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-[11px] text-text-muted">
            Real-time directional power vectors & sensing branch status
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAnimateParticles(!animateParticles)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#14181C] border border-[#232931] text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors"
            title="Pause or Resume Flow Animations"
          >
            {animateParticles ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Pause Motion</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Resume Motion</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main SVG Spatial Topology Canvas */}
      <div className="relative w-full flex-1 flex items-center justify-center my-2 z-10 min-h-[320px]">
        {/* SVG Flow Lines & Particles */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 360"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="solarToHomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="solarToBatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="batToHomeGrad" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gridToHomeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* 1. Path: Solar (300, 50) -> Home Load (140, 180) */}
          <path
            d="M 300 70 L 140 180"
            fill="none"
            stroke={solarToHomeW > 0 ? 'url(#solarToHomeGrad)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={solarToHomeW > 0 ? Math.min(4, 1.5 + (solarToHomeW / 2000)) : 1}
            strokeDasharray={solarToHomeW > 0 ? 'none' : '4 4'}
          />
          {animateParticles && solarToHomeW > 0 && (
            <circle r="3.5" fill="#F59E0B">
              <animateMotion
                path="M 300 70 L 140 180"
                dur={`${Math.max(1.2, 4.0 - (solarToHomeW / 1500))}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* 2. Path: Solar (300, 50) -> Battery (460, 180) */}
          <path
            d="M 300 70 L 460 180"
            fill="none"
            stroke={solarToBatteryW > 0 ? 'url(#solarToBatGrad)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={solarToBatteryW > 0 ? Math.min(4, 1.5 + (solarToBatteryW / 2000)) : 1}
            strokeDasharray={solarToBatteryW > 0 ? 'none' : '4 4'}
          />
          {animateParticles && solarToBatteryW > 0 && (
            <circle r="3.5" fill="#10B981">
              <animateMotion
                path="M 300 70 L 460 180"
                dur={`${Math.max(1.2, 4.0 - (solarToBatteryW / 1500))}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* 3. Path: Battery (460, 180) -> Home Load (140, 180) */}
          <path
            d="M 460 180 L 140 180"
            fill="none"
            stroke={batteryToHomeW > 0 ? 'url(#batToHomeGrad)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={batteryToHomeW > 0 ? Math.min(4, 1.5 + (batteryToHomeW / 2000)) : 1}
            strokeDasharray={batteryToHomeW > 0 ? 'none' : '4 4'}
          />
          {animateParticles && batteryToHomeW > 0 && (
            <circle r="3.5" fill="#10B981">
              <animateMotion
                path="M 460 180 L 140 180"
                dur={`${Math.max(1.2, 4.0 - (batteryToHomeW / 1500))}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* 4. Path: Grid (300, 310) -> Home Load (140, 180) */}
          <path
            d="M 300 310 L 140 180"
            fill="none"
            stroke={gridToHomeW > 0 ? 'url(#gridToHomeGrad)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={gridToHomeW > 0 ? Math.min(4, 1.5 + (gridToHomeW / 2000)) : 1}
            strokeDasharray={gridToHomeW > 0 ? 'none' : '4 4'}
          />
          {animateParticles && gridToHomeW > 0 && (
            <circle r="3.5" fill="#8B5CF6">
              <animateMotion
                path="M 300 310 L 140 180"
                dur={`${Math.max(1.2, 4.0 - (gridToHomeW / 1500))}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>

        {/* Spatial HTML Nodes */}
        <div className="w-full max-w-xl h-full flex flex-col justify-between items-center py-2 relative z-10">
          
          {/* NODE 1: SOLAR (TOP) */}
          <div 
            onClick={() => setSelectedTopologyNode('solar')}
            className="w-48 bg-[#14181C] border border-amber-500/40 rounded-lg p-3 cursor-pointer hover:border-amber-400 hover:bg-[#1A2027] transition-all shadow-subtle flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block">SOLAR PV</span>
                <span className="text-sm font-mono font-bold text-white tabular-nums">
                  {formatKW(solar.powerW)} <span className="text-[10px] text-amber-400 font-normal">kW</span>
                </span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          </div>

          {/* MID ROW: HOME LOAD (LEFT) & BATTERY (RIGHT) */}
          <div className="w-full flex items-center justify-between px-2 md:px-8 my-6">
            
            {/* NODE 2: HOME LOAD (LEFT) */}
            <div 
              onClick={() => setSelectedTopologyNode('load')}
              className="w-48 bg-[#14181C] border border-cyan-500/40 rounded-lg p-3 cursor-pointer hover:border-cyan-400 hover:bg-[#1A2027] transition-all shadow-subtle flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase block">HOME LOAD</span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    {formatKW(load.powerW)} <span className="text-[10px] text-cyan-400 font-normal">kW</span>
                  </span>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            </div>

            {/* NODE 3: BATTERY (RIGHT) */}
            <div 
              onClick={() => setSelectedTopologyNode('battery')}
              className="w-48 bg-[#14181C] border border-emerald-500/40 rounded-lg p-3 cursor-pointer hover:border-emerald-400 hover:bg-[#1A2027] transition-all shadow-subtle flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase block">BATTERY ({battery.socPercent.toFixed(0)}%)</span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    {battery.powerW > 0 ? (battery.state === 'charging' ? `+${formatKW(battery.powerW)}` : `-${formatKW(battery.powerW)}`) : '0.00'}{' '}
                    <span className="text-[10px] text-emerald-400 font-normal">kW</span>
                  </span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${battery.state === 'charging' ? 'bg-emerald-500 animate-pulse' : battery.state === 'discharging' ? 'bg-amber-500' : 'bg-text-muted'}`}></div>
            </div>
          </div>

          {/* NODE 4: GRID (BOTTOM) */}
          <div 
            onClick={() => setSelectedTopologyNode('grid')}
            className={`w-48 bg-[#14181C] border rounded-lg p-3 cursor-pointer transition-all shadow-subtle flex items-center justify-between group ${
              grid.powerW > 0 
                ? 'border-purple-500/40 hover:border-purple-400 hover:bg-[#1A2027]' 
                : 'border-[#262C34] opacity-70 hover:opacity-100 hover:border-[#384250]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block">GRID BRANCH</span>
                <span className="text-sm font-mono font-bold text-white tabular-nums">
                  {formatKW(grid.powerW)} <span className="text-[10px] text-purple-400 font-normal">kW</span>
                </span>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${grid.powerW > 0 ? 'bg-purple-500 animate-pulse' : 'bg-text-muted'}`}></div>
          </div>

        </div>
      </div>

      {/* Bottom Route Summary Bar */}
      <div className="pt-3 border-t border-[#1C2229] grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono z-10">
        <div className="p-2 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
          <span className="text-text-muted">Solar → Home:</span>
          <span className="text-amber-400 font-medium tabular-nums">{formatKW(solarToHomeW)} kW</span>
        </div>
        <div className="p-2 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
          <span className="text-text-muted">Solar → Battery:</span>
          <span className="text-emerald-400 font-medium tabular-nums">{formatKW(solarToBatteryW)} kW</span>
        </div>
        <div className="p-2 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
          <span className="text-text-muted">Battery → Home:</span>
          <span className="text-emerald-400 font-medium tabular-nums">{formatKW(batteryToHomeW)} kW</span>
        </div>
        <div className="p-2 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
          <span className="text-text-muted">Grid → Home:</span>
          <span className="text-purple-400 font-medium tabular-nums">{formatKW(gridToHomeW)} kW</span>
        </div>
      </div>

      {/* Node Inspector Modal Component */}
      <TopologyNodeInspector />
    </div>
  );
};
