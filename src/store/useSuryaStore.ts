import { create } from 'zustand';
import type { 
  TelemetryData, 
  SystemStatusData, 
  AIPipelineState, 
  AssistantMessage, 
  SystemConfig, 
  HistoricalPoint, 
  AnalyticsSummary,
  SystemMode 
} from '../types/suryaStore';
import { 
  generateInitialTelemetry, 
  calculateSimulatedStep, 
  generateHistoricalData, 
  generateAnalyticsSummary 
} from '../lib/simulation';
import type { SimState } from '../lib/simulation';

export type ActiveTab = 'dashboard' | 'flow' | 'analytics' | 'status' | 'ai-management' | 'assistant' | 'settings';

interface SuryaStoreState {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Selected spatial node for deep inspection
  selectedTopologyNode: 'solar' | 'battery' | 'load' | 'grid' | null;
  setSelectedTopologyNode: (node: 'solar' | 'battery' | 'load' | 'grid' | null) => void;

  // Core Data State
  telemetry: TelemetryData;
  status: SystemStatusData;
  ai: AIPipelineState;
  historical: HistoricalPoint[];
  analyticsSummary: AnalyticsSummary;
  
  // Assistant Thread
  assistantMessages: AssistantMessage[];
  addAssistantMessage: (msg: Omit<AssistantMessage, 'id' | 'timestamp'>) => void;
  isAssistantThinking: boolean;

  // System Configuration & Mode
  config: SystemConfig;
  updateConfig: (partial: Partial<SystemConfig>) => void;

  // Simulation Internal State & Control
  simState: SimState;
  isSimulating: boolean;
  setSimulating: (simulating: boolean) => void;
  setScenario: (scenario: SystemConfig['simulatedScenario']) => void;
  toggleSystemMode: () => void;
  setRelayState: (relayId: 'relay1' | 'relay2', state: boolean) => void;

  // Tick step runner
  tickSimulation: () => void;
}

const initialHistorical = generateHistoricalData();
const initialSummary = generateAnalyticsSummary(initialHistorical);

export const useSuryaStore = create<SuryaStoreState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),

  selectedTopologyNode: null,
  setSelectedTopologyNode: (node: 'solar' | 'battery' | 'load' | 'grid' | null) => set({ selectedTopologyNode: node }),

  telemetry: generateInitialTelemetry(),
  status: {
    esp32: {
      connected: true,
      ip: '192.168.1.104',
      rssi: -62,
      uptimeSeconds: 148290,
      firmwareVersion: 'v2.4.1-edge',
      lastHeartbeat: new Date().toISOString()
    },
    sensors: {
      solar: {
        id: 'ina226_0x40',
        name: 'INA226 #1 (Solar PV Branch)',
        i2cAddress: '0x40',
        busVoltageV: 48.2,
        shuntVoltagemV: 75.45,
        currentA: 100.6,
        powerW: 4850,
        status: 'OK',
        lastReading: new Date().toISOString()
      },
      battery: {
        id: 'ina226_0x41',
        name: 'INA226 #2 (Battery Storage Branch)',
        i2cAddress: '0x41',
        busVoltageV: 51.4,
        shuntVoltagemV: 35.7,
        currentA: 47.6,
        powerW: 2450,
        status: 'OK',
        lastReading: new Date().toISOString()
      },
      load: {
        id: 'ina226_0x42',
        name: 'INA226 #3 (Home Load Branch)',
        i2cAddress: '0x42',
        busVoltageV: 48.0,
        shuntVoltagemV: 37.5,
        currentA: 50.0,
        powerW: 2400,
        status: 'OK',
        lastReading: new Date().toISOString()
      }
    },
    chargeController: {
      status: 'BOOST',
      efficiencyPercent: 96.8,
      temperatureC: 38.4
    },
    batteryProtection: {
      minSocCutoff: 20,
      maxVoltageThreshold: 57.6,
      activeProtection: false
    },
    events: [
      {
        id: 'evt_1',
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'AI optimization engine running cleanly. Latency: 142ms',
        source: 'AI_ENGINE'
      }
    ]
  },
  ai: {
    pipelineStage: 'decide',
    lastExecutionTimestamp: new Date().toISOString(),
    latencyMs: 142,
    predictions: {
      predictedSolarW: 5100,
      predictedDemandW: 2350,
      forecastWindowMinutes: 60,
      confidencePercent: 94.2
    },
    decision: {
      code: 'SURPLUS_SOLAR_CHARGING',
      title: 'SURPLUS SOLAR DETECTED',
      action: 'Routing surplus power to Battery storage',
      details: '4.85 kW generated • 2.45 kW to battery',
      why: 'Solar generation currently exceeds household demand. Battery SOC is 72.4% (<98%). Controller is routing surplus into battery storage via bench Relay #2.',
      timestamp: new Date().toISOString()
    },
    controlSignal: {
      targetRelay1: true,
      targetRelay2: true,
      latencyMs: 38,
      status: 'executed'
    }
  },

  historical: initialHistorical,
  analyticsSummary: initialSummary,

  assistantMessages: [
    {
      id: 'msg_init_1',
      sender: 'assistant',
      text: 'SuryaStore AI Assistant active. Connected to live hardware node (ESP32 @ 192.168.1.104) and sensing branches (3x INA226).\n\nCurrent status:\n- Solar PV: 4.85 kW\n- Home Demand: 2.40 kW\n- Battery: 72.4% SOC (Charging +2.45 kW)\n- AI Decision: Surplus solar directed to battery storage.\n\nHow can I assist with your energy monitoring or relay controls?',
      timestamp: new Date().toISOString()
    }
  ],
  isAssistantThinking: false,

  config: {
    wifiSsid: 'Lab_Solar_5G',
    mqttBroker: 'mqtt.suryastore.internal',
    mqttPort: 1883,
    telemetryTopic: 'suryastore/telemetry/live',
    controlTopic: 'suryastore/control/relay',
    minSocPercent: 20,
    overVoltageThresholdV: 57.6,
    notificationsEnabled: true,
    simulationSpeed: 'realtime',
    simulatedScenario: 'normal_day'
  },

  updateConfig: (partial: Partial<SystemConfig>) => set((state) => ({
    config: { ...state.config, ...partial }
  })),

  simState: {
    timeOfDayHours: 13.2,
    batterySoc: 72.4,
    isAutoMode: true,
    manualRelay1: true,
    manualRelay2: true,
    scenario: 'normal_day'
  },
  isSimulating: true,
  setSimulating: (simulating: boolean) => set({ isSimulating: simulating }),

  setScenario: (scenario: SystemConfig['simulatedScenario']) => set((state) => ({
    config: { ...state.config, simulatedScenario: scenario },
    simState: { ...state.simState, scenario }
  })),

  toggleSystemMode: () => set((state) => {
    const newAuto = !state.simState.isAutoMode;
    const mode: SystemMode = newAuto ? 'AUTO' : 'MANUAL';
    return {
      simState: { ...state.simState, isAutoMode: newAuto },
      telemetry: {
        ...state.telemetry,
        relays: {
          relay1: { ...state.telemetry.relays.relay1, mode },
          relay2: { ...state.telemetry.relays.relay2, mode }
        }
      }
    };
  }),

  setRelayState: (relayId: 'relay1' | 'relay2', stateValue: boolean) => set((state) => ({
    simState: {
      ...state.simState,
      isAutoMode: false,
      manualRelay1: relayId === 'relay1' ? stateValue : state.simState.manualRelay1,
      manualRelay2: relayId === 'relay2' ? stateValue : state.simState.manualRelay2
    },
    telemetry: {
      ...state.telemetry,
      relays: {
        ...state.telemetry.relays,
        [relayId]: {
          ...state.telemetry.relays[relayId],
          state: stateValue,
          mode: 'MANUAL'
        }
      }
    }
  })),

  addAssistantMessage: (msg: Omit<AssistantMessage, 'id' | 'timestamp'>) => set((state) => ({
    assistantMessages: [
      ...state.assistantMessages,
      {
        ...msg,
        id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    ]
  })),

  tickSimulation: () => {
    const state = get();
    if (!state.isSimulating) return;

    const { telemetry, status, ai, nextSimState } = calculateSimulatedStep(state.simState, state.config);
    set({
      telemetry,
      status,
      ai,
      simState: nextSimState
    });
  }
}));
