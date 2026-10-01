import React, { useState } from 'react';
import { Wifi, Radio, ShieldCheck, Save, CheckCircle2 } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const SettingsView: React.FC = () => {
  const { config, updateConfig } = useSuryaStore();
  const [formData, setFormData] = useState(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <h2 className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
          SYSTEM PARAMETERS & CONFIGURATIONS
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Configure hardware network bindings, MQTT broker topics, and battery safety cutoffs
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. NETWORK SETTINGS */}
        <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#1E232A]">
            <Wifi className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase">Network & ESP32 Connectivity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">Wi-Fi Network SSID</label>
              <input
                type="text"
                value={formData.wifiSsid}
                onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-amber-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">ESP32 Fixed IP Address</label>
              <input
                type="text"
                value="192.168.1.104"
                disabled
                className="w-full bg-[#14181C]/50 border border-[#1E232A] rounded px-3 py-2 text-text-muted font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 2. MQTT BROKER SETTINGS */}
        <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#1E232A]">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase">MQTT Telemetry & Command Broker</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">MQTT Broker Host</label>
              <input
                type="text"
                value={formData.mqttBroker}
                onChange={(e) => setFormData({ ...formData, mqttBroker: e.target.value })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">MQTT Port</label>
              <input
                type="number"
                value={formData.mqttPort}
                onChange={(e) => setFormData({ ...formData, mqttPort: Number(e.target.value) })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">Telemetry Inbound Topic</label>
              <input
                type="text"
                value={formData.telemetryTopic}
                onChange={(e) => setFormData({ ...formData, telemetryTopic: e.target.value })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">Relay Command Outbound Topic</label>
              <input
                type="text"
                value={formData.controlTopic}
                onChange={(e) => setFormData({ ...formData, controlTopic: e.target.value })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-cyan-500/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. BATTERY PROTECTION THRESHOLDS */}
        <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#1E232A]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase">Battery Protection Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">Minimum SOC Cutoff (%)</label>
              <input
                type="number"
                value={formData.minSocPercent}
                onChange={(e) => setFormData({ ...formData, minSocPercent: Number(e.target.value) })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-emerald-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-text-muted mb-1 uppercase text-[10px]">Over-Voltage Threshold (V)</label>
              <input
                type="number"
                step="0.1"
                value={formData.overVoltageThresholdV}
                onChange={(e) => setFormData({ ...formData, overVoltageThresholdV: Number(e.target.value) })}
                className="w-full bg-[#14181C] border border-[#232931] rounded px-3 py-2 text-white font-mono focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration saved and applied to system!</span>
            </div>
          )}
          {!savedSuccess && <div></div>}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setFormData(config)}
              className="px-4 py-2 rounded bg-[#14181C] border border-[#232931] text-xs font-mono text-text-secondary hover:text-white transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-xs font-semibold font-mono text-black transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
