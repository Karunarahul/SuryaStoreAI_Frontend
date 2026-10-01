import React from 'react';
import { Brain, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';

export const AIDecisionPanel: React.FC = () => {
  const { ai, setActiveTab } = useSuryaStore();
  const { decision, predictions } = ai;

  return (
    <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-4 md:p-5 flex flex-col justify-between hover:border-[#28313D] transition-colors relative overflow-hidden">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-text-primary tracking-wider uppercase">
                AI OPTIMIZATION DECISION
              </span>
              <span className="block text-[10px] font-mono text-text-muted">
                Model Latency: {ai.latencyMs}ms • Confidence: {predictions.confidencePercent}%
              </span>
            </div>
          </div>
          
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
            {ai.controlSignal.status}
          </span>
        </div>

        {/* Decision Title & Action */}
        <div className="my-3 p-3 rounded bg-[#14181C] border border-[#1E232A]">
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-tight">{decision.title}</h3>
          </div>
          <p className="text-xs font-medium text-white mb-1.5">{decision.action}</p>
          <span className="text-[11px] font-mono text-text-secondary block">{decision.details}</span>
        </div>

        {/* Rationale Section: "WHY" */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center space-x-1.5 text-text-muted text-[11px] font-mono uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPLANATION / RATIONALE</span>
          </div>
          <p className="text-text-secondary text-[11px] leading-relaxed bg-[#101418] p-2.5 rounded border border-[#1C2229]">
            {decision.why}
          </p>
        </div>
      </div>

      {/* Footer Navigation link */}
      <div className="mt-4 pt-3 border-t border-[#1C2229] flex items-center justify-between">
        <span className="text-[10px] font-mono text-text-muted">STAGE: {ai.pipelineStage.toUpperCase()}</span>
        <button
          onClick={() => setActiveTab('ai-management')}
          className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-mono transition-colors group"
        >
          <span>Inspect AI Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
