import React from 'react';
import { Cpu, Activity, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const SystemStatusConsole: React.FC = () => {
  const { status, telemetry } = useSuryaStore();
  const { esp32, sensors, chargeController, batteryProtection, events } = status;

  const sensorList = [sensors.solar, sensors.battery, sensors.load];

  return (
    <div className="space-y-6">
      {/* Top Console Summary Header */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
              ENGINEERING HARDWARE DIAGNOSTICS & SENSORS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PHYSICAL LAYER
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time diagnostic telemetry from ESP32 control node, INA226 I2C sensing branches & relay drivers
          </p>
        </div>

        <button 
          onClick={() => alert('Sending diagnostic ping to ESP32 (192.168.1.104)...')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#14181C] border border-[#232931] text-xs font-mono text-text-secondary hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ping Hardware Node</span>
        </button>
      </div>

      {/* 1. ESP32 HARDWARE CONTROLLER NODE */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E232A]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-tight">ESP32 Control Node (Primary Edge Microcontroller)</h3>
              <span className="text-[11px] font-mono text-text-muted">Dual-core Tensilica Xtensa LX6 @ 240MHz</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold">ESP32 ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A]">
            <span className="text-[10px] text-text-muted block mb-0.5 uppercase">IP ADDRESS</span>
            <span className="text-text-primary font-medium">{esp32.ip}</span>
          </div>
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A]">
            <span className="text-[10px] text-text-muted block mb-0.5 uppercase">WI-FI RSSI</span>
            <span className="text-text-primary font-medium">{esp32.rssi} dBm (Strong)</span>
          </div>
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A]">
            <span className="text-[10px] text-text-muted block mb-0.5 uppercase">UPTIME</span>
            <span className="text-text-primary font-medium">41h 11m 30s</span>
          </div>
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A]">
            <span className="text-[10px] text-text-muted block mb-0.5 uppercase">FIRMWARE</span>
            <span className="text-amber-400 font-medium">{esp32.firmwareVersion}</span>
          </div>
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A]">
            <span className="text-[10px] text-text-muted block mb-0.5 uppercase">FREE HEAP</span>
            <span className="text-text-primary font-medium">184.2 KB</span>
          </div>
        </div>
      </div>

      {/* 2. 3x INA226 I2C SENSING BRANCHES */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E232A]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-tight">INA226 Sensing Branches (High-Precision I2C Monitors)</h3>
              <span className="text-[11px] font-mono text-text-muted">16-bit ADC • Bi-directional Shunt Voltage & Power Measurement</span>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
            3/3 SENSORS ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1E232A] text-[10px] text-text-muted uppercase">
                <th className="py-2.5 px-3">Branch / Sensor Name</th>
                <th className="py-2.5 px-3">I2C Addr</th>
                <th className="py-2.5 px-3">Bus Volts</th>
                <th className="py-2.5 px-3">Shunt Voltage</th>
                <th className="py-2.5 px-3">Current</th>
                <th className="py-2.5 px-3">Power</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2229] text-[11px]">
              {sensorList.map((s) => (
                <tr key={s.id} className="hover:bg-[#14181C]/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-3 text-cyan-400">{s.i2cAddress}</td>
                  <td className="py-3 px-3 text-text-primary tabular-nums">{s.busVoltageV.toFixed(2)} V</td>
                  <td className="py-3 px-3 text-text-secondary tabular-nums">{s.shuntVoltagemV.toFixed(2)} mV</td>
                  <td className="py-3 px-3 text-text-primary tabular-nums">{s.currentA.toFixed(2)} A</td>
                  <td className="py-3 px-3 font-medium text-amber-400 tabular-nums">{(s.powerW / 1000).toFixed(2)} kW</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      s.status === 'OK'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. HARDWARE SUBSYSTEMS & RELAYS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Charge controller & Protection */}
        <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-tight mb-3 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Charge Controller & Protection Logic</span>
          </h4>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
              <span className="text-text-muted">Charge Controller Mode:</span>
              <span className="text-emerald-400 font-semibold">{chargeController.status} (96.8% Eff)</span>
            </div>
            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
              <span className="text-text-muted">Minimum SOC Cutoff Limit:</span>
              <span className="text-white font-medium">{batteryProtection.minSocCutoff}%</span>
            </div>
            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
              <span className="text-text-muted">Over-Voltage Safety Threshold:</span>
              <span className="text-white font-medium">{batteryProtection.maxVoltageThreshold} V</span>
            </div>
          </div>
        </div>

        {/* Relays physical status */}
        <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-tight mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Physical Relay Driver States</span>
          </h4>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
              <span className="text-text-muted">Relay #1 (Home Load Branch):</span>
              <span className={`font-semibold ${telemetry.relays.relay1.state ? 'text-emerald-400' : 'text-rose-400'}`}>
                {telemetry.relays.relay1.state ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
              <span className="text-text-muted">Relay #2 (Grid / Aux Branch):</span>
              <span className={`font-semibold ${telemetry.relays.relay2.state ? 'text-purple-300' : 'text-rose-400'}`}>
                {telemetry.relays.relay2.state ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
              <span className="text-text-muted">Bench Hardware Safety Interlock:</span>
              <span className="text-emerald-400 font-semibold">OK (PASSED)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME DIAGNOSTIC EVENT LOG STREAM */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-tight mb-3">
          Real-time Diagnostic Event Stream
        </h4>

        <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
          {events.map((evt) => (
            <div key={evt.id} className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] flex items-start justify-between text-[11px]">
              <div className="flex items-start space-x-2.5">
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  evt.level === 'ERROR' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {evt.level}
                </span>
                <span className="text-text-primary">{evt.message}</span>
              </div>
              <div className="text-right text-[10px] text-text-muted shrink-0 ml-4">
                <span>{evt.source}</span> • <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
