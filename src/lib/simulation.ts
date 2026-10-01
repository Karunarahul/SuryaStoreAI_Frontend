import type { TelemetryData, SystemStatusData, AIPipelineState, SystemConfig, HistoricalPoint, AnalyticsSummary } from '../types/suryaStore';

export interface SimState {
  timeOfDayHours: number; // 0 to 24
  batterySoc: number; // 0 to 100
  isAutoMode: boolean;
  manualRelay1: boolean;
  manualRelay2: boolean;
  scenario: SystemConfig['simulatedScenario'];
}

export function generateInitialTelemetry(): TelemetryData {
  return {
    solar: { powerW: 4850, voltageV: 48.2, currentA: 100.6, status: 'generating' },
    battery: { powerW: 2450, voltageV: 51.4, currentA: 47.6, socPercent: 72.4, state: 'charging', capacityAh: 200, maxVoltageV: 57.6, minVoltageV: 44.0, healthPercent: 98.5 },
    load: { powerW: 2400, voltageV: 48.0, currentA: 50.0, status: 'normal' },
    grid: { powerW: 0, voltageV: 48.0, currentA: 0.0, status: 'standby', mode: 'idle' },
    relays: {
      relay1: { id: 'relay1', name: 'Relay #1 — Home Load Branch', description: 'Bench Test Circuit #1', state: true, mode: 'AUTO' },
      relay2: { id: 'relay2', name: 'Relay #2 — Grid / Deferrable Load', description: 'Bench Test Circuit #2', state: false, mode: 'AUTO' },
    },
    timestamp: new Date().toISOString(),
    benchNote: 'Bench Prototype (Low-Voltage 48V DC Bus Circuit)'
  };
}

export function calculateSimulatedStep(
  currentState: SimState,
  config: SystemConfig
): {
  telemetry: TelemetryData;
  status: SystemStatusData;
  ai: AIPipelineState;
  nextSimState: SimState;
} {
  const { timeOfDayHours, batterySoc, isAutoMode, manualRelay1, manualRelay2, scenario } = currentState;
  const now = new Date();
  const timeStr = now.toISOString();

  // Calculate Solar Generation Curve based on Time of Day (Peak at 13:00)
  let solarBaseW = 0;
  if (timeOfDayHours >= 6 && timeOfDayHours <= 18) {
    const sunAngle = ((timeOfDayHours - 6) / 12) * Math.PI; // 0 to PI
    solarBaseW = Math.max(0, Math.sin(sunAngle) * 6200);
  }

  // Adjust for scenarios
  if (scenario === 'peak_solar') {
    solarBaseW = 7450 + Math.sin(now.getTime() / 2000) * 150;
  } else if (scenario === 'cloud_cover') {
    solarBaseW = solarBaseW * 0.25;
  } else if (scenario === 'night_discharge') {
    solarBaseW = 0;
  }

  // Calculate Household Demand Curve (Peaks morning 8am, evening 7pm)
  let demandBaseW = 1800;
  if ((timeOfDayHours >= 7 && timeOfDayHours <= 9) || (timeOfDayHours >= 18 && timeOfDayHours <= 22)) {
    demandBaseW = 3800 + Math.cos(now.getTime() / 3000) * 200;
  } else if (timeOfDayHours >= 10 && timeOfDayHours <= 16) {
    demandBaseW = 2100;
  }
  
  if (scenario === 'night_discharge') {
    demandBaseW = 3200;
  }

  // Micro-fluctuations for realism
  const noiseSolar = (Math.random() - 0.5) * 40;
  const noiseDemand = (Math.random() - 0.5) * 30;

  const solarW = Math.max(0, Math.round(solarBaseW + noiseSolar));
  const loadW = Math.max(200, Math.round(demandBaseW + noiseDemand));
  const netPower = solarW - loadW;

  // Determine Battery State & Power
  let batteryW = 0;
  let batteryState: 'charging' | 'discharging' | 'idle' = 'idle';
  let gridW = 0;
  let gridMode: 'import' | 'export' | 'idle' = 'idle';
  let gridStatus: 'active' | 'standby' | 'disconnected' = 'standby';

  let newSoc = batterySoc;

  if (scenario === 'grid_outage') {
    gridStatus = 'disconnected';
  } else {
    gridStatus = 'active';
  }

  // Logic: Energy allocation
  if (netPower > 0) {
    // Surplus Solar
    if (batterySoc < 98) {
      batteryW = Math.min(netPower, 4500); // Charging battery up to max charge rate
      batteryState = 'charging';
      const surplusAfterBattery = netPower - batteryW;
      if (surplusAfterBattery > 50 && gridStatus === 'active') {
        gridW = surplusAfterBattery;
        gridMode = 'export';
      }
    } else {
      // Battery is full
      batteryState = 'idle';
      if (gridStatus === 'active') {
        gridW = netPower;
        gridMode = 'export';
      }
    }
    // Update SOC upwards
    newSoc = Math.min(100, batterySoc + (batteryW / 4500) * 0.04);
  } else {
    // Deficit Solar (Load exceeds Solar)
    const deficitW = Math.abs(netPower);
    if (batterySoc > config.minSocPercent) {
      batteryW = Math.min(deficitW, 4000);
      batteryState = 'discharging';
      const remainingDeficit = deficitW - batteryW;
      if (remainingDeficit > 50 && gridStatus === 'active') {
        gridW = remainingDeficit;
        gridMode = 'import';
      }
    } else {
      // Battery depleted to cutoff threshold
      batteryState = 'idle';
      if (gridStatus === 'active') {
        gridW = deficitW;
        gridMode = 'import';
      }
    }
    // Update SOC downwards
    if (batteryState === 'discharging') {
      newSoc = Math.max(config.minSocPercent, batterySoc - (batteryW / 4000) * 0.04);
    }
  }

  // Relay states
  let relay1State = isAutoMode ? true : manualRelay1;
  let relay2State = isAutoMode ? (batteryState === 'charging' || gridMode === 'export') : manualRelay2;

  // Voltages & Currents (48V nominal system)
  const systemVoltageV = 48.0 + (batteryState === 'charging' ? 3.4 * (newSoc / 100) : -2.8 * ((100 - newSoc) / 100));
  const solarCurrentA = solarW > 0 ? Number((solarW / systemVoltageV).toFixed(2)) : 0;
  const batteryCurrentA = batteryW > 0 ? Number((batteryW / systemVoltageV).toFixed(2)) : 0;
  const loadCurrentA = Number((loadW / systemVoltageV).toFixed(2));
  const gridCurrentA = gridW > 0 ? Number((gridW / systemVoltageV).toFixed(2)) : 0;

  // AI Decision & Pipeline Stage
  let decisionTitle = '';
  let decisionAction = '';
  let decisionDetails = '';
  let decisionWhy = '';
  let decisionCode = '';

  if (solarW > loadW) {
    decisionCode = 'SURPLUS_SOLAR_CHARGING';
    decisionTitle = 'SURPLUS SOLAR DETECTED';
    decisionAction = 'Routing surplus power to Battery storage';
    decisionDetails = `${(solarW / 1000).toFixed(2)} kW generated • ${(batteryW / 1000).toFixed(2)} kW to battery`;
    decisionWhy = `Solar generation (${(solarW / 1000).toFixed(2)} kW) exceeds demand (${(loadW / 1000).toFixed(2)} kW). Battery SOC is ${newSoc.toFixed(1)}% (target <98%). Relay #2 closed for optimal storage.`;
  } else if (batteryState === 'discharging') {
    decisionCode = 'PEAK_SHAVING_DISCHARGE';
    decisionTitle = 'BATTERY PEAK SHAVING ACTIVE';
    decisionAction = 'Discharging battery to cover demand deficit';
    decisionDetails = `${(batteryW / 1000).toFixed(2)} kW discharged • Grid import reduced to 0 kW`;
    decisionWhy = `Household demand (${(loadW / 1000).toFixed(2)} kW) exceeds solar (${(solarW / 1000).toFixed(2)} kW). Battery is at ${newSoc.toFixed(1)}% (above min threshold ${config.minSocPercent}%). Supplying load from storage.`;
  } else if (newSoc <= config.minSocPercent) {
    decisionCode = 'MIN_SOC_GRID_FALLBACK';
    decisionTitle = 'BATTERY AT MINIMUM SOC THRESHOLD';
    decisionAction = 'Engaged Grid fallback circuit to preserve battery health';
    decisionDetails = `Battery SOC ${newSoc.toFixed(1)}% ≤ ${config.minSocPercent}% cutoff limit`;
    decisionWhy = `Battery state of charge reached minimum safety boundary (${config.minSocPercent}%). Discharging suspended to prevent cell degradation. Deficit powered via simulated grid branch.`;
  } else {
    decisionCode = 'SYSTEM_BALANCED_STANDBY';
    decisionTitle = 'SYSTEM POWER BALANCED';
    decisionAction = 'Maintaining standby optimization profile';
    decisionDetails = `Solar: ${(solarW / 1000).toFixed(2)} kW • Demand: ${(loadW / 1000).toFixed(2)} kW`;
    decisionWhy = `Generation and demand are closely aligned. Battery operating in float buffer state. All safety parameters normal.`;
  }

  // Telemetry construct
  const telemetry: TelemetryData = {
    solar: {
      powerW: solarW,
      voltageV: Number(systemVoltageV.toFixed(2)),
      currentA: solarCurrentA,
      status: solarW > 4000 ? 'peak' : solarW > 500 ? 'generating' : 'low'
    },
    battery: {
      powerW: batteryW,
      voltageV: Number(systemVoltageV.toFixed(2)),
      currentA: batteryCurrentA,
      socPercent: Number(newSoc.toFixed(1)),
      state: batteryState,
      capacityAh: 200,
      maxVoltageV: 57.6,
      minVoltageV: 44.0,
      healthPercent: 98.5
    },
    load: {
      powerW: loadW,
      voltageV: Number(systemVoltageV.toFixed(2)),
      currentA: loadCurrentA,
      status: loadW > 4500 ? 'peak' : 'normal'
    },
    grid: {
      powerW: gridW,
      voltageV: Number(systemVoltageV.toFixed(2)),
      currentA: gridCurrentA,
      status: gridStatus,
      mode: gridMode
    },
    relays: {
      relay1: {
        id: 'relay1',
        name: 'Relay #1 — Home Load Branch',
        description: 'Low-voltage bench circuit #1 (Main Load)',
        state: relay1State,
        mode: isAutoMode ? 'AUTO' : 'MANUAL'
      },
      relay2: {
        id: 'relay2',
        name: 'Relay #2 — Grid / Deferrable Load',
        description: 'Low-voltage bench circuit #2 (Aux / Grid Sim)',
        state: relay2State,
        mode: isAutoMode ? 'AUTO' : 'MANUAL'
      }
    },
    timestamp: timeStr,
    benchNote: 'Bench Prototype: 48V Low-Voltage Test Circuit'
  };

  // Hardware Status construct
  const sensorFault = scenario === 'sensor_fault';
  const status: SystemStatusData = {
    esp32: {
      connected: true,
      ip: '192.168.1.104',
      rssi: -62,
      uptimeSeconds: 148290,
      firmwareVersion: 'v2.4.1-edge',
      lastHeartbeat: timeStr
    },
    sensors: {
      solar: {
        id: 'ina226_0x40',
        name: 'INA226 #1 (Solar PV Branch)',
        i2cAddress: '0x40',
        busVoltageV: Number(systemVoltageV.toFixed(2)),
        shuntVoltagemV: Number((solarCurrentA * 0.75).toFixed(2)),
        currentA: solarCurrentA,
        powerW: solarW,
        status: 'OK',
        lastReading: timeStr
      },
      battery: {
        id: 'ina226_0x41',
        name: 'INA226 #2 (Battery Storage Branch)',
        i2cAddress: '0x41',
        busVoltageV: Number(systemVoltageV.toFixed(2)),
        shuntVoltagemV: Number((batteryCurrentA * 0.75).toFixed(2)),
        currentA: batteryCurrentA,
        powerW: batteryW,
        status: sensorFault ? 'FAULT' : 'OK',
        lastReading: timeStr
      },
      load: {
        id: 'ina226_0x42',
        name: 'INA226 #3 (Home Load Branch)',
        i2cAddress: '0x42',
        busVoltageV: Number(systemVoltageV.toFixed(2)),
        shuntVoltagemV: Number((loadCurrentA * 0.75).toFixed(2)),
        currentA: loadCurrentA,
        powerW: loadW,
        status: 'OK',
        lastReading: timeStr
      }
    },
    chargeController: {
      status: batteryState === 'charging' ? 'BOOST' : 'FLOAT',
      efficiencyPercent: 96.8,
      temperatureC: 38.4
    },
    batteryProtection: {
      minSocCutoff: config.minSocPercent,
      maxVoltageThreshold: config.overVoltageThresholdV,
      activeProtection: newSoc <= config.minSocPercent
    },
    events: [
      {
        id: 'evt_1',
        timestamp: timeStr,
        level: sensorFault ? 'ERROR' : 'INFO',
        message: sensorFault ? 'INA226 0x41 I2C Communication Error / Check Shunt Resistor' : 'AI optimization cycle executed cleanly (142ms latency)',
        source: sensorFault ? 'INA226_DRIVER' : 'AI_ENGINE'
      },
      {
        id: 'evt_2',
        timestamp: new Date(now.getTime() - 120000).toISOString(),
        level: 'INFO',
        message: `Relay #1 state confirmed: ${relay1State ? 'CLOSED (ON)' : 'OPEN (OFF)'}`,
        source: 'ESP32_GPIO'
      },
      {
        id: 'evt_3',
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        level: 'SYSTEM',
        message: `MQTT Broker ping: 12ms RTT (mqtt.suryastore.internal:1883)`,
        source: 'NETWORK'
      }
    ]
  };

  // AI Pipeline state construct
  const ai: AIPipelineState = {
    pipelineStage: (now.getSeconds() % 6 < 2) ? 'predict' : (now.getSeconds() % 6 < 4) ? 'decide' : 'control',
    lastExecutionTimestamp: timeStr,
    latencyMs: 142,
    predictions: {
      predictedSolarW: Math.round(solarW * 1.05 + 100),
      predictedDemandW: Math.round(loadW * 0.98),
      forecastWindowMinutes: 60,
      confidencePercent: 94.2
    },
    decision: {
      code: decisionCode,
      title: decisionTitle,
      action: decisionAction,
      details: decisionDetails,
      why: decisionWhy,
      timestamp: timeStr
    },
    controlSignal: {
      targetRelay1: relay1State,
      targetRelay2: relay2State,
      latencyMs: 38,
      status: isAutoMode ? 'executed' : 'manual_override'
    }
  };

  const timeAdvance = config.simulationSpeed === '60x' ? 0.2 : config.simulationSpeed === '10x' ? 0.05 : 0.005;
  let nextHours = timeOfDayHours + timeAdvance;
  if (nextHours >= 24) nextHours = 0;

  return {
    telemetry,
    status,
    ai,
    nextSimState: {
      ...currentState,
      timeOfDayHours: nextHours,
      batterySoc: newSoc
    }
  };
}

export function generateHistoricalData(): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hour = time.getHours();
    
    // Solar shape
    let solarW = 0;
    if (hour >= 6 && hour <= 18) {
      solarW = Math.max(0, Math.round(Math.sin(((hour - 6) / 12) * Math.PI) * 5800 + (Math.random() - 0.5) * 300));
    }
    
    // Load shape
    let loadW = 1600;
    if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 22)) {
      loadW = 3400 + Math.round((Math.random() - 0.5) * 400);
    } else if (hour >= 10 && hour <= 16) {
      loadW = 2100 + Math.round((Math.random() - 0.5) * 200);
    }
    
    const net = solarW - loadW;
    let batteryW = 0;
    let gridW = 0;
    let soc = 50 + Math.sin((hour / 24) * Math.PI * 2) * 35;
    soc = Math.min(98, Math.max(20, Math.round(soc)));

    if (net > 0) {
      batteryW = Math.min(net, 3500);
      gridW = net - batteryW > 0 ? net - batteryW : 0;
    } else {
      batteryW = Math.max(net, -3000);
      gridW = net - batteryW < 0 ? Math.abs(net - batteryW) : 0;
    }

    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    points.push({
      time: timeLabel,
      solarW,
      loadW,
      batteryW,
      batterySoc: soc,
      gridW
    });
  }
  
  return points;
}

export function generateAnalyticsSummary(points: HistoricalPoint[]): AnalyticsSummary {
  let totalSolarWh = 0;
  let totalLoadWh = 0;
  let batteryChargeWh = 0;
  let batteryDischargeWh = 0;

  points.forEach(p => {
    totalSolarWh += p.solarW;
    totalLoadWh += p.loadW;
    if (p.batteryW > 0) batteryChargeWh += p.batteryW;
    else batteryDischargeWh += Math.abs(p.batteryW);
  });

  const totalSolarKWh = Number((totalSolarWh / 1000).toFixed(2));
  const totalLoadKWh = Number((totalLoadWh / 1000).toFixed(2));
  const batteryChargeKWh = Number((batteryChargeWh / 1000).toFixed(2));
  const batteryDischargeKWh = Number((batteryDischargeWh / 1000).toFixed(2));

  const selfConsumptionPercent = totalSolarKWh > 0 
    ? Number((Math.min(100, ((totalSolarKWh - 1.2) / totalSolarKWh) * 100)).toFixed(1))
    : 0;

  const gridReductionPercent = Number((82.4).toFixed(1));

  return {
    totalSolarGeneratedKWh: totalSolarKWh,
    totalHomeConsumedKWh: totalLoadKWh,
    batteryChargedKWh: batteryChargeKWh,
    batteryDischargedKWh: batteryDischargeKWh,
    selfConsumptionPercent,
    gridReductionPercent,
    peakDemandSavedKWh: 4.8
  };
}
