export type SystemMode = 'AUTO' | 'MANUAL';

export interface BranchTelemetry {
  powerW: number;
  voltageV: number;
  currentA: number;
  status?: string;
}

export interface BatteryTelemetry extends BranchTelemetry {
  socPercent: number;
  state: 'charging' | 'discharging' | 'idle';
  capacityAh: number;
  maxVoltageV: number;
  minVoltageV: number;
  healthPercent: number;
}

export interface GridTelemetry extends BranchTelemetry {
  status: 'active' | 'standby' | 'disconnected';
  mode: 'import' | 'export' | 'idle';
}

export interface RelayState {
  id: string;
  name: string;
  description: string;
  state: boolean; // true = ON / closed, false = OFF / open
  mode: SystemMode;
}

export interface TelemetryData {
  solar: BranchTelemetry;
  battery: BatteryTelemetry;
  load: BranchTelemetry;
  grid: GridTelemetry;
  relays: {
    relay1: RelayState;
    relay2: RelayState;
  };
  timestamp: string;
  benchNote: string;
}

export interface INA226Sensor {
  id: string;
  name: string;
  i2cAddress: string;
  busVoltageV: number;
  shuntVoltagemV: number;
  currentA: number;
  powerW: number;
  status: 'OK' | 'WARNING' | 'FAULT';
  lastReading: string;
}

export interface SystemStatusData {
  esp32: {
    connected: boolean;
    ip: string;
    rssi: number;
    uptimeSeconds: number;
    firmwareVersion: string;
    lastHeartbeat: string;
  };
  sensors: {
    solar: INA226Sensor;
    battery: INA226Sensor;
    load: INA226Sensor;
  };
  chargeController: {
    status: 'OK' | 'BOOST' | 'FLOAT' | 'WARNING';
    efficiencyPercent: number;
    temperatureC: number;
  };
  batteryProtection: {
    minSocCutoff: number;
    maxVoltageThreshold: number;
    activeProtection: boolean;
  };
  events: Array<{
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
    message: string;
    source: string;
  }>;
}

export interface AIPipelineState {
  pipelineStage: 'predict' | 'decide' | 'control' | 'idle';
  lastExecutionTimestamp: string;
  latencyMs: number;
  predictions: {
    predictedSolarW: number;
    predictedDemandW: number;
    forecastWindowMinutes: number;
    confidencePercent: number;
  };
  decision: {
    code: string;
    title: string;
    action: string;
    details: string;
    why: string;
    timestamp: string;
  };
  controlSignal: {
    targetRelay1: boolean;
    targetRelay2: boolean;
    latencyMs: number;
    status: 'executed' | 'verifying' | 'manual_override';
  };
}

export interface AnalyticsSummary {
  totalSolarGeneratedKWh: number;
  totalHomeConsumedKWh: number;
  batteryChargedKWh: number;
  batteryDischargedKWh: number;
  selfConsumptionPercent: number;
  gridReductionPercent: number;
  peakDemandSavedKWh: number;
}

export interface HistoricalPoint {
  time: string;
  solarW: number;
  loadW: number;
  batteryW: number; // positive = charging, negative = discharging
  batterySoc: number;
  gridW: number;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  telemetrySnapshot?: {
    solarPower: string;
    batteryPower: string;
    batterySoc: string;
    loadPower: string;
    gridPower: string;
    decisionTitle?: string;
  };
}

export interface SystemConfig {
  wifiSsid: string;
  mqttBroker: string;
  mqttPort: number;
  telemetryTopic: string;
  controlTopic: string;
  minSocPercent: number;
  overVoltageThresholdV: number;
  notificationsEnabled: boolean;
  simulationSpeed: 'realtime' | '10x' | '60x';
  simulatedScenario: 'normal_day' | 'peak_solar' | 'cloud_cover' | 'night_discharge' | 'grid_outage' | 'sensor_fault';
}
