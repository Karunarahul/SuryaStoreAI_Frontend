import React, { useState } from 'react';
import { 
  Sun, 
  Home, 
  BatteryCharging, 
  Zap, 
  Download
} from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { historical, analyticsSummary } = useSuryaStore();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('day');

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0E1114] border border-[#232931] p-3 rounded shadow-xl text-xs font-mono space-y-1 z-50">
          <p className="text-text-primary font-semibold mb-1 border-b border-[#1E232A] pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="text-white font-medium tabular-nums">{entry.value} {entry.unit || 'W'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filters */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
              ENERGY EFFICIENCY & HISTORICAL TELEMETRY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              AGGREGATED DATA
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            24-hour diurnal power analysis and storage utilization efficiency
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#14181C] border border-[#232931] rounded p-0.5">
            {(['day', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-mono rounded capitalize transition-colors ${
                  timeRange === r
                    ? 'bg-[#262E37] text-white font-medium'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Exporting telemetry log as CSV...')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#14181C] border border-[#232931] text-xs font-mono text-text-secondary hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0E1114] border border-[#1E232A] rounded p-4">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-2">
            <Sun className="w-4 h-4" />
            <span>TOTAL SOLAR GENERATION</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analyticsSummary.totalSolarGeneratedKWh} <span className="text-xs text-amber-400 font-normal">kWh</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted block mt-1">24h Diurnal Output</span>
        </div>

        <div className="bg-[#0E1114] border border-[#1E232A] rounded p-4">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-2">
            <Home className="w-4 h-4" />
            <span>TOTAL HOUSEHOLD DEMAND</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analyticsSummary.totalHomeConsumedKWh} <span className="text-xs text-cyan-400 font-normal">kWh</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted block mt-1">Total Bench Consumption</span>
        </div>

        <div className="bg-[#0E1114] border border-[#1E232A] rounded p-4">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-2">
            <BatteryCharging className="w-4 h-4" />
            <span>SELF-CONSUMPTION RATE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analyticsSummary.selfConsumptionPercent}%
          </div>
          <span className="text-[10px] font-mono text-text-muted block mt-1">Solar Used Locally</span>
        </div>

        <div className="bg-[#0E1114] border border-[#1E232A] rounded p-4">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono mb-2">
            <Zap className="w-4 h-4" />
            <span>GRID RELIANCE REDUCTION</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            -{analyticsSummary.gridReductionPercent}%
          </div>
          <span className="text-[10px] font-mono text-text-muted block mt-1">Saved via Storage</span>
        </div>
      </div>

      {/* CHART 1: Solar Generation vs Household Demand */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
              Solar Generation vs Household Consumption (Watts)
            </h3>
            <p className="text-[11px] text-text-muted">Hourly average power distribution curve</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historical} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solarArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="loadArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#5D6670" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#5D6670" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="solarW" name="Solar PV" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#solarArea)" unit="W" />
              <Area type="monotone" dataKey="loadW" name="Home Load" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#loadArea)" unit="W" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Battery State of Charge (%) & Storage Power (Watts) */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
              Battery Storage SOC (%) & Charge/Discharge Power (Watts)
            </h3>
            <p className="text-[11px] text-text-muted">Storage dynamics managed via AI relay optimization</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historical} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#5D6670" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis yAxisId="soc" domain={[0, 100]} stroke="#10B981" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis yAxisId="power" orientation="right" stroke="#8B5CF6" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="soc" type="monotone" dataKey="batterySoc" name="Battery SOC" stroke="#10B981" strokeWidth={2.5} dot={false} unit="%" />
              <Line yAxisId="power" type="monotone" dataKey="batteryW" name="Storage Power" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} unit="W" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
