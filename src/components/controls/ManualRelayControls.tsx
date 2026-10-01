import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Cpu, AlertTriangle, Lock } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const ManualRelayControls: React.FC = () => {
  const { telemetry, simState, toggleSystemMode, setRelayState } = useSuryaStore();
  const { relays } = telemetry;
  
  const [confirmRelay, setConfirmRelay] = useState<{ id: 'relay1' | 'relay2'; targetState: boolean; name: string } | null>(null);

  const handleToggleClick = (relayId: 'relay1' | 'relay2', currentState: boolean, name: string) => {
    // Prompt confirmation if in Auto mode or changing grid relay
    setConfirmRelay({
      id: relayId,
      targetState: !currentState,
      name
    });
  };

  const confirmAction = () => {
    if (confirmRelay) {
      setRelayState(confirmRelay.id, confirmRelay.targetState);
      setConfirmRelay(null);
    }
  };

  return (
    <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-4 md:p-5 flex flex-col justify-between hover:border-[#28313D] transition-colors relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-text-primary tracking-wider uppercase">
                HARDWARE RELAY OVERRIDE
              </span>
              <span className="block text-[10px] font-mono text-text-muted">
                ESP32 GPIO 16 & GPIO 17 Signals
              </span>
            </div>
          </div>

          <button
            onClick={toggleSystemMode}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono font-semibold transition-colors ${
              simState.isAutoMode
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {simState.isAutoMode ? 'AI AUTO' : 'MANUAL'}
          </button>
        </div>

        {/* Auto mode info banner */}
        {simState.isAutoMode && (
          <div className="mb-3 p-2.5 rounded bg-[#14181C] border border-[#1E232A] text-[11px] text-text-secondary flex items-start space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>AI optimization is automatically managing relay switching. Toggling any relay will switch system to MANUAL mode.</span>
          </div>
        )}

        {/* Relay Controls */}
        <div className="space-y-2.5">
          {/* RELAY 1 */}
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-white">Relay #1 — Home Load</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${relays.relay1.state ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                  {relays.relay1.state ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-muted block mt-0.5">Low-Voltage Bench Circuit #1 (Load Branch)</span>
            </div>

            <button
              onClick={() => handleToggleClick('relay1', relays.relay1.state, 'Relay #1 — Home Load')}
              className={`p-1.5 rounded transition-colors ${
                relays.relay1.state 
                  ? 'text-emerald-400 hover:text-emerald-300' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {relays.relay1.state ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
            </button>
          </div>

          {/* RELAY 2 */}
          <div className="p-3 rounded bg-[#14181C] border border-[#1E232A] flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-white">Relay #2 — Grid / Deferrable Load</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${relays.relay2.state ? 'bg-purple-500/15 text-purple-300' : 'bg-rose-500/15 text-rose-400'}`}>
                  {relays.relay2.state ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-muted block mt-0.5">Low-Voltage Bench Circuit #2 (Grid Sim)</span>
            </div>

            <button
              onClick={() => handleToggleClick('relay2', relays.relay2.state, 'Relay #2 — Grid / Aux')}
              className={`p-1.5 rounded transition-colors ${
                relays.relay2.state 
                  ? 'text-purple-400 hover:text-purple-300' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {relays.relay2.state ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bench note */}
      <div className="mt-3 pt-2.5 border-t border-[#1C2229] flex items-center justify-between text-[10px] font-mono text-text-muted">
        <span>BENCH PROTOCOL: GPIO PULSE (100ms)</span>
        <span className="text-emerald-400">HARDWARE INTERLOCK OK</span>
      </div>

      {/* Confirmation Modal */}
      {confirmRelay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E1114] border border-[#232931] rounded-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-semibold font-mono text-white">Confirm Relay State Override</h4>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              You are overriding <strong className="text-white">{confirmRelay.name}</strong> to state:{' '}
              <strong className={confirmRelay.targetState ? 'text-emerald-400' : 'text-rose-400'}>
                {confirmRelay.targetState ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </strong>
              . This will switch system control mode to MANUAL.
            </p>

            <div className="p-2.5 rounded bg-[#14181C] border border-[#1E232A] text-[11px] font-mono text-text-muted">
              Note: Current prototype operates on low-voltage bench test circuit (48V nominal).
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmRelay(null)}
                className="px-3 py-1.5 rounded bg-[#14181C] border border-[#232931] text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-black transition-colors"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
