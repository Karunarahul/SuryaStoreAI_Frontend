import React from 'react';
import { SpatialEnergyTopology } from '../../components/energy-flow/SpatialEnergyTopology';
import { AIDecisionPanel } from '../../components/ai/AIDecisionPanel';
import { ManualRelayControls } from '../../components/controls/ManualRelayControls';
import { TelemetryPanel } from '../../components/telemetry/TelemetryPanel';
import { useSuryaStore } from '../../store/useSuryaStore';
import { TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { analyticsSummary } = useSuryaStore();

  return (
    <div className="space-y-6">
      {/* System Operational Banner */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <span className="font-mono text-text-primary font-medium">
            System Operational • INA226 Telemetry Active • Optimization Loop 500ms
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono text-text-muted">
          <span>Self-Consumption: <strong className="text-emerald-400 font-normal">{analyticsSummary.selfConsumptionPercent}%</strong></span>
          <span>•</span>
          <span>Grid Reliance Saved: <strong className="text-purple-400 font-normal">82.4%</strong></span>
        </div>
      </div>

      {/* Hero Spatial Topology Visualization */}
      <section>
        <SpatialEnergyTopology />
      </section>

      {/* AI Decision Rationale & Hardware Relay Override Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIDecisionPanel />
        <ManualRelayControls />
      </section>

      {/* Supporting Instrumentation Telemetry Grid (Solar, Battery, Load, Grid) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
            Branch Telemetry Instrumentation
          </h2>
          <span className="text-[10px] font-mono text-text-muted">3x INA226 + Grid Test Bus</span>
        </div>
        <TelemetryPanel />
      </section>

      {/* Daily Energy Summary Quick Bar */}
      <section className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="text-text-primary font-semibold">24-Hour Diurnal Energy Summary:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] w-full sm:w-auto">
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Solar Generated</span>
            <span className="text-amber-400 font-bold">{analyticsSummary.totalSolarGeneratedKWh} kWh</span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Home Consumed</span>
            <span className="text-cyan-400 font-bold">{analyticsSummary.totalHomeConsumedKWh} kWh</span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Battery Charged</span>
            <span className="text-emerald-400 font-bold">{analyticsSummary.batteryChargedKWh} kWh</span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase">Battery Discharged</span>
            <span className="text-emerald-400 font-bold">{analyticsSummary.batteryDischargedKWh} kWh</span>
          </div>
        </div>
      </section>
    </div>
  );
};
