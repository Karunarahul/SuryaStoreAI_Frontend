import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { useSuryaStore } from '../../store/useSuryaStore';
import { apiClient } from '../../lib/api';

export const AIAssistantChat: React.FC = () => {
  const { telemetry, ai, assistantMessages, addAssistantMessage } = useSuryaStore();
  const { solar, battery, load, grid } = telemetry;

  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const suggestedQuestions = [
    'Why is my battery charging?',
    'Why is solar generation low?',
    'Why is grid power inactive?',
    'What is my current self-consumption?',
    'How do I troubleshoot INA226 sensor errors?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToUse = queryText || inputMsg;
    if (!textToUse.trim() || isSending) return;

    setInputMsg('');
    setIsSending(true);

    // 1. Add user message
    addAssistantMessage({
      sender: 'user',
      text: textToUse
    });

    // 2. Call API (client fallback fallback)
    const response = await apiClient.sendAssistantChat({
      message: textToUse,
      contextTelemetry: {
        solarW: solar.powerW,
        batteryW: battery.powerW,
        batterySoc: battery.socPercent,
        loadW: load.powerW,
        gridW: grid.powerW,
        activeDecisionCode: ai.decision.code
      }
    });

    // 3. Add assistant response
    addAssistantMessage({
      sender: 'assistant',
      text: response.replyText,
      telemetrySnapshot: {
        solarPower: `${(solar.powerW / 1000).toFixed(2)} kW`,
        batteryPower: `${(battery.powerW / 1000).toFixed(2)} kW`,
        batterySoc: `${battery.socPercent.toFixed(1)}%`,
        loadPower: `${(load.powerW / 1000).toFixed(2)} kW`,
        gridPower: `${(grid.powerW / 1000).toFixed(2)} kW`,
        decisionTitle: ai.decision.title
      }
    });

    setIsSending(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header bar with live context chips */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-tight">
              SURYASTORE AI ASSISTANT
            </h3>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>CONNECTED TO LIVE SYSTEM</span>
            </div>
          </div>
        </div>

        {/* Live Context Chips */}
        <div className="flex items-center space-x-2 text-[11px] font-mono overflow-x-auto pb-1 md:pb-0">
          <div className="px-2.5 py-1 rounded bg-[#14181C] border border-[#232931] text-amber-400 whitespace-nowrap">
            Solar: {(solar.powerW / 1000).toFixed(2)} kW
          </div>
          <div className="px-2.5 py-1 rounded bg-[#14181C] border border-[#232931] text-emerald-400 whitespace-nowrap">
            Battery: {battery.socPercent.toFixed(1)}%
          </div>
          <div className="px-2.5 py-1 rounded bg-[#14181C] border border-[#232931] text-cyan-400 whitespace-nowrap">
            Load: {(load.powerW / 1000).toFixed(2)} kW
          </div>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-[#14181C] border border-[#232931] text-xs font-sans text-text-secondary hover:text-white hover:border-amber-500/40 transition-colors whitespace-nowrap shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="bg-[#0E1114] border border-[#1E232A] rounded-lg p-4 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
        {assistantMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex space-x-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl rounded-lg p-4 text-xs font-sans space-y-2.5 ${
                isAssistant
                  ? 'bg-[#14181C] border border-[#1E232A] text-text-primary'
                  : 'bg-amber-500/15 border border-amber-500/30 text-white font-medium'
              }`}>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Telemetry Snapshot Reference */}
                {msg.telemetrySnapshot && (
                  <div className="pt-2 border-t border-[#232931] grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <div className="p-1.5 rounded bg-[#0E1114]">
                      <span className="text-text-muted block">SOLAR</span>
                      <span className="text-amber-400 font-bold">{msg.telemetrySnapshot.solarPower}</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#0E1114]">
                      <span className="text-text-muted block">BATTERY</span>
                      <span className="text-emerald-400 font-bold">{msg.telemetrySnapshot.batterySoc}</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#0E1114]">
                      <span className="text-text-muted block">DEMAND</span>
                      <span className="text-cyan-400 font-bold">{msg.telemetrySnapshot.loadPower}</span>
                    </div>
                  </div>
                )}

                <span className="text-[10px] font-mono text-text-muted block text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded bg-[#1C2229] border border-[#2B3440] text-text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-2 text-text-muted text-xs font-mono">
            <Bot className="w-4 h-4 animate-bounce text-amber-400" />
            <span>SuryaStore AI is calculating response...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask SuryaStore AI about system telemetry, relay states, or INA226 sensors..."
          className="flex-1 bg-[#0E1114] border border-[#1E232A] rounded-lg px-4 py-3 text-xs text-text-primary placeholder:text-text-muted focus:border-amber-500/60 focus:outline-none font-sans"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputMsg.trim() || isSending}
          className="px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs flex items-center space-x-1.5 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </div>
    </div>
  );
};
