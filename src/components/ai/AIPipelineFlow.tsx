import React from 'react';
import { LineChart, Brain, Radio, Clock, ShieldCheck, Activity } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const AIPipelineFlow: React.FC = () => {
  const { ai } = useSuryaStore();
  const { predictions, decision, controlSignal, pipelineStage } = ai;

  const stages = [
    {
      id: 'predict',
      name: '1. PREDICT',
      subtitle: 'Solar & Demand Forecast Model',
      icon: LineChart,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      activeBorder: 'border-amber-400 bg-amber-500/10',
      metrics: [
        { label: 'Forecast Solar', value: `${(predictions.predictedSolarW / 1000).toFixed(2)} kW` },
        { label: 'Forecast Demand', value: `${(predictions.predictedDemandW / 1000).toFixed(2)} kW` },
        { label: 'Forecast Window', value: `${predictions.forecastWindowMinutes} mins` },
        { label: 'Model Confidence', value: `${predictions.confidencePercent}%` },
      ],
      details: 'Evaluates historical irradiance, diurnal solar curves, and household consumption trends to predict 60-minute energy balance.'
    },
    {
      id: 'decide',
      name: '2. DECIDE',
      subtitle: 'Energy Optimization Matrix',
      icon: Brain,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      activeBorder: 'border-cyan-400 bg-cyan-500/10',
      metrics: [
        { label: 'Active Strategy', value: decision.code },
        { label: 'Target Action', value: decision.action },
        { label: 'Decision Latency', value: `${ai.latencyMs} ms` },
        { label: 'Battery Protection', value: 'Active (20-98%)' },
      ],
      details: decision.why
    },
    {
      id: 'control',
      name: '3. CONTROL',
      subtitle: 'ESP32 Relay Signal Dispatch',
      icon: Radio,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      activeBorder: 'border-emerald-400 bg-emerald-500/10',
      metrics: [
        { label: 'Relay #1 (Load)', value: controlSignal.targetRelay1 ? 'CLOSED (1)' : 'OPEN (0)' },
        { label: 'Relay #2 (Grid/Aux)', value: controlSignal.targetRelay2 ? 'CLOSED (1)' : 'OPEN (0)' },
        { label: 'Signal Latency', value: `${controlSignal.latencyMs} ms` },
        { label: 'Execution Mode', value: controlSignal.status.toUpperCase() },
      ],
      details: 'Dispatches 3.3V GPIO control pulses to bench relays over local low-latency MQTT/HTTP command channel.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
                PREDICT → DECIDE → CONTROL PIPELINE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE PIPELINE LOOP
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Continuous 500ms feedback loop executing real-time allocation algorithms and hardware control dispatches
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-text-muted">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cycle Time: {ai.latencyMs + controlSignal.latencyMs}ms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Model: v2.4-edge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continuous Pipeline Container */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-6 relative overflow-hidden">
        {/* Signal Flow Visual Line */}
        <div className="hidden lg:block absolute top-[92px] left-12 right-12 h-0.5 bg-[#1C2229] z-0">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 transition-all duration-500"
            style={{
              width: pipelineStage === 'predict' ? '33%' : pipelineStage === 'decide' ? '66%' : '100%'
            }}
          ></div>
        </div>

        {/* 3 Pipeline Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isCurrentStage = pipelineStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`bg-[#14181C] border rounded-lg p-5 transition-all duration-200 ${
                  isCurrentStage 
                    ? stage.activeBorder + ' shadow-card scale-[1.01]' 
                    : 'border-[#1E232A] hover:border-[#28313D]'
                }`}
              >
                {/* Stage Badge & Title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded border ${stage.borderColor} bg-[#0E1114] ${stage.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-tight">{stage.name}</h4>
                      <span className="text-[11px] font-mono text-text-muted">{stage.subtitle}</span>
                    </div>
                  </div>

                  {isCurrentStage && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {stage.metrics.map((m) => (
                    <div key={m.label} className="p-2 rounded bg-[#0E1114] border border-[#1E232A]">
                      <span className="text-[10px] font-mono text-text-muted uppercase block">{m.label}</span>
                      <span className="text-xs font-mono font-medium text-text-primary tabular-nums">{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* Stage Rationale / Detail Box */}
                <div className="pt-3 border-t border-[#1E232A]">
                  <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">STAGE LOGIC & STATUS</span>
                  <p className="text-[11px] text-text-secondary leading-relaxed bg-[#0E1114] p-2.5 rounded border border-[#1A2027]">
                    {stage.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench Hardware Command Execution Table */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-5">
        <h4 className="text-xs font-mono font-semibold text-text-primary uppercase mb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>BENCH HARDWARE RELAY COMMAND LOG</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1E232A] text-[10px] text-text-muted uppercase">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Relay Target</th>
                <th className="py-2 px-3">Commanded State</th>
                <th className="py-2 px-3">Response Latency</th>
                <th className="py-2 px-3">ESP32 ACK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2229] text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-text-secondary">{ai.lastExecutionTimestamp}</td>
                <td className="py-2.5 px-3 text-white">Relay #1 (Home Load)</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-400">CLOSED (1)</td>
                <td className="py-2.5 px-3 text-text-secondary">38 ms</td>
                <td className="py-2.5 px-3 text-emerald-400">ACK 200 OK</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-text-secondary">{ai.lastExecutionTimestamp}</td>
                <td className="py-2.5 px-3 text-white">Relay #2 (Grid/Aux)</td>
                <td className="py-2.5 px-3 font-semibold text-amber-400">
                  {controlSignal.targetRelay2 ? 'CLOSED (1)' : 'OPEN (0)'}
                </td>
                <td className="py-2.5 px-3 text-text-secondary">42 ms</td>
                <td className="py-2.5 px-3 text-emerald-400">ACK 200 OK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
