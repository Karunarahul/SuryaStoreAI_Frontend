import React from 'react';
import { Sun, BatteryCharging, Home, Zap, X, ShieldCheck, Cpu } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const TopologyNodeInspector: React.FC = () => {
  const { selectedTopologyNode, setSelectedTopologyNode, telemetry, status } = useSuryaStore();

  if (!selectedTopologyNode) return null;

  const getNodeInfo = () => {
    switch (selectedTopologyNode) {
      case 'solar':
        return {
          title: 'Solar PV Generation Branch',
          icon: Sun,
          color: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/10',
          sensor: status.sensors.solar,
          metrics: [
            { label: 'Live Power', value: `${(telemetry.solar.powerW / 1000).toFixed(2)} kW (${telemetry.solar.powerW} W)` },
            { label: 'Bus Voltage', value: `${telemetry.solar.voltageV.toFixed(2)} V DC` },
            { label: 'PV Current', value: `${telemetry.solar.currentA.toFixed(2)} A` },
            { label: 'Sensing Chip', value: 'INA226 @ 0x40 (I2C)' },
            { label: 'Physical Shunt', value: '0.002 Ω Shunt Resistor' },
            { label: 'Operating Status', value: (telemetry.solar.status || 'OK').toUpperCase() },
          ],
          notes: 'Direct 48V DC bench PV array inputs connected to INA226 High-Side Shunt Monitor.'
        };
      case 'battery':
        return {
          title: 'Battery Storage System (LiFePO4)',
          icon: BatteryCharging,
          color: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgColor: 'bg-emerald-500/10',
          sensor: status.sensors.battery,
          metrics: [
            { label: 'State of Charge (SOC)', value: `${telemetry.battery.socPercent.toFixed(1)}%` },
            { label: 'Current Flow', value: `${telemetry.battery.state.toUpperCase()} (${(telemetry.battery.powerW / 1000).toFixed(2)} kW)` },
            { label: 'Terminal Voltage', value: `${telemetry.battery.voltageV.toFixed(2)} V DC` },
            { label: 'Battery Current', value: `${telemetry.battery.currentA.toFixed(2)} A` },
            { label: 'Min SOC Cutoff', value: `${status.batteryProtection.minSocCutoff}%` },
            { label: 'Max Voltage Cutoff', value: `${status.batteryProtection.maxVoltageThreshold} V` },
            { label: 'Sensing Chip', value: 'INA226 @ 0x41 (I2C)' },
            { label: 'Battery Health', value: `${telemetry.battery.healthPercent}% SOH` },
          ],
          notes: '48V 200Ah bench LiFePO4 pack. Managed via automatic relay protection circuit.'
        };
      case 'load':
        return {
          title: 'Household Load Branch',
          icon: Home,
          color: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          bgColor: 'bg-cyan-500/10',
          sensor: status.sensors.load,
          metrics: [
            { label: 'Total Consumption', value: `${(telemetry.load.powerW / 1000).toFixed(2)} kW (${telemetry.load.powerW} W)` },
            { label: 'Branch Voltage', value: `${telemetry.load.voltageV.toFixed(2)} V DC` },
            { label: 'Load Current', value: `${telemetry.load.currentA.toFixed(2)} A` },
            { label: 'Controlled via', value: 'Bench Relay #1 (Home Load)' },
            { label: 'Relay #1 Status', value: telemetry.relays.relay1.state ? 'CLOSED (ON)' : 'OPEN (OFF)' },
            { label: 'Sensing Chip', value: 'INA226 @ 0x42 (I2C)' },
          ],
          notes: 'Main DC household branch circuit powering benchmark test loads.'
        };
      case 'grid':
        return {
          title: 'Simulated Grid Branch',
          icon: Zap,
          color: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          bgColor: 'bg-purple-500/10',
          sensor: null,
          metrics: [
            { label: 'Grid Power Flow', value: `${(telemetry.grid.powerW / 1000).toFixed(2)} kW (${telemetry.grid.mode.toUpperCase()})` },
            { label: 'Branch Voltage', value: `${telemetry.grid.voltageV.toFixed(2)} V DC` },
            { label: 'Grid Current', value: `${telemetry.grid.currentA.toFixed(2)} A` },
            { label: 'Controlled via', value: 'Bench Relay #2 (Grid / Aux)' },
            { label: 'Relay #2 Status', value: telemetry.relays.relay2.state ? 'CLOSED (ON)' : 'OPEN (OFF)' },
            { label: 'Grid Connection', value: telemetry.grid.status.toUpperCase() },
          ],
          notes: 'Simulated low-voltage test circuit. Represents secondary utility connection without high-voltage hazard.'
        };
    }
  };

  const info = getNodeInfo();
  const Icon = info.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-[#0E1114] border border-[#232931] rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b border-[#1E232A] flex items-center justify-between ${info.bgColor}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded border ${info.borderColor} ${info.bgColor} ${info.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">{info.title}</h3>
              <p className="text-[11px] font-mono text-text-muted">Node Diagnostics & Sensor Parameters</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedTopologyNode(null)}
            className="p-1 rounded text-text-muted hover:text-white hover:bg-[#1A2027] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {info.metrics.map((m) => (
              <div key={m.label} className="p-2.5 rounded bg-[#14181C] border border-[#1E232A]">
                <span className="text-[10px] font-mono text-text-muted uppercase block mb-0.5">{m.label}</span>
                <span className="text-xs font-mono font-medium text-text-primary tabular-nums">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Low-voltage bench note */}
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A] flex items-start space-x-2.5 text-xs">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-text-primary block text-[11px] font-mono uppercase mb-0.5">Bench Hardware Note</span>
              <p className="text-text-secondary text-[11px] leading-relaxed">{info.notes}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0A0D10] border-t border-[#1E232A] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INA226 Telemetry Verified</span>
          </div>
          <button
            onClick={() => setSelectedTopologyNode(null)}
            className="px-3 py-1 rounded bg-[#1A2027] border border-[#2B3440] text-text-primary hover:bg-[#232B35] text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
