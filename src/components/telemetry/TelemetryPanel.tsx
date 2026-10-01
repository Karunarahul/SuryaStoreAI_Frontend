import React from 'react';
import { Sun, BatteryCharging, Home, Zap } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const TelemetryPanel: React.FC = () => {
  const { telemetry } = useSuryaStore();
  const { solar, battery, load, grid } = telemetry;

  const formatKW = (powerW: number) => (powerW / 1000).toFixed(2);
  const formatV = (v: number) => v.toFixed(1);
  const formatA = (a: number) => a.toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. SOLAR PV BRANCH */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded p-3.5 flex flex-col justify-between hover:border-[#2C3440] transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-1 bg-amber-500/40"></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-primary tracking-tight">SOLAR PV</span>
                <span className="block text-[10px] font-mono text-text-muted">INA226 @ 0x40</span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {solar.status}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {formatKW(solar.powerW)}
              </span>
              <span className="text-xs font-mono font-medium text-amber-400">kW</span>
            </div>
            <span className="text-[11px] text-text-muted font-mono">{solar.powerW} Watts</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#1C2229] grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-text-muted text-[10px] block">BUS VOLTAGE</span>
            <span className="text-text-primary font-medium tabular-nums">{formatV(solar.voltageV)} V</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">PV CURRENT</span>
            <span className="text-text-primary font-medium tabular-nums">{formatA(solar.currentA)} A</span>
          </div>
        </div>
      </div>

      {/* 2. BATTERY STORAGE BRANCH */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded p-3.5 flex flex-col justify-between hover:border-[#2C3440] transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-1 bg-emerald-500/40"></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-primary tracking-tight">BATTERY STORAGE</span>
                <span className="block text-[10px] font-mono text-text-muted">INA226 @ 0x41</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
              battery.state === 'charging' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : battery.state === 'discharging'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-[#181D23] text-text-muted border border-[#262E38]'
            }`}>
              {battery.state}
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                  {battery.socPercent.toFixed(1)}
                </span>
                <span className="text-xs font-mono font-medium text-emerald-400">% SOC</span>
              </div>
              <span className="text-[11px] text-text-muted font-mono">
                {battery.powerW > 0 ? (battery.state === 'charging' ? `+${formatKW(battery.powerW)} kW` : `-${formatKW(battery.powerW)} kW`) : '0.00 kW'}
              </span>
            </div>

            {/* SOC Bar Visualizer */}
            <div className="w-12 bg-[#181E26] h-2.5 rounded-full overflow-hidden border border-[#252D38]">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, battery.socPercent))}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#1C2229] grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-text-muted text-[10px] block">BATTERY VOLTS</span>
            <span className="text-text-primary font-medium tabular-nums">{formatV(battery.voltageV)} V</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">BUS CURRENT</span>
            <span className="text-text-primary font-medium tabular-nums">{formatA(battery.currentA)} A</span>
          </div>
        </div>
      </div>

      {/* 3. HOME LOAD BRANCH */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded p-3.5 flex flex-col justify-between hover:border-[#2C3440] transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-1 bg-cyan-500/40"></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-primary tracking-tight">HOUSEHOLD DEMAND</span>
                <span className="block text-[10px] font-mono text-text-muted">INA226 @ 0x42</span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {load.status}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {formatKW(load.powerW)}
              </span>
              <span className="text-xs font-mono font-medium text-cyan-400">kW</span>
            </div>
            <span className="text-[11px] text-text-muted font-mono">{load.powerW} Watts</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#1C2229] grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-text-muted text-[10px] block">LOAD VOLTAGE</span>
            <span className="text-text-primary font-medium tabular-nums">{formatV(load.voltageV)} V</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">LOAD CURRENT</span>
            <span className="text-text-primary font-medium tabular-nums">{formatA(load.currentA)} A</span>
          </div>
        </div>
      </div>

      {/* 4. SIMULATED GRID BRANCH */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded p-3.5 flex flex-col justify-between hover:border-[#2C3440] transition-colors relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-1 bg-purple-500/40"></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-primary tracking-tight">GRID BRANCH</span>
                <span className="block text-[10px] font-mono text-text-muted">Simulated Test Bus</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
              grid.status === 'active' 
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                : 'bg-[#181D23] text-text-muted border border-[#262E38]'
            }`}>
              {grid.status}
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {formatKW(grid.powerW)}
              </span>
              <span className="text-xs font-mono font-medium text-purple-400">kW</span>
            </div>
            <span className="text-[11px] text-text-muted font-mono uppercase">
              {grid.powerW > 0 ? `${grid.mode} mode` : 'Standby / 0 kW'}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#1C2229] grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-text-muted text-[10px] block">GRID VOLTS</span>
            <span className="text-text-primary font-medium tabular-nums">{formatV(grid.voltageV)} V</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">GRID RELIANCE</span>
            <span className="text-emerald-400 font-medium tabular-nums">-82.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
