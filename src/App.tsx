import React, { useEffect } from 'react';
import { Sidebar } from './components/shell/Sidebar';
import { Header } from './components/shell/Header';
import { MobileNav } from './components/shell/MobileNav';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { SpatialEnergyTopology } from './components/energy-flow/SpatialEnergyTopology';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SystemStatusConsole } from './components/diagnostics/SystemStatusConsole';
import { AIPipelineFlow } from './components/ai/AIPipelineFlow';
import { AIAssistantChat } from './components/assistant/AIAssistantChat';
import { SettingsView } from './components/settings/SettingsView';
import { useSuryaStore } from './store/useSuryaStore';

export const App: React.FC = () => {
  const { activeTab, tickSimulation, isSimulating } = useSuryaStore();

  // Run simulation tick every 500ms
  useEffect(() => {
    if (!isSimulating) return;
    const timer = setInterval(() => {
      tickSimulation();
    }, 500);
    return () => clearInterval(timer);
  }, [isSimulating, tickSimulation]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'flow':
        return <SpatialEnergyTopology isFullScreenView={true} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'status':
        return <SystemStatusConsole />;
      case 'ai-management':
        return <AIPipelineFlow />;
      case 'assistant':
        return <AIAssistantChat />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080A0C] text-[#F4F6F8]">
      {/* Desktop Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Application Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Sticky Navigation */}
      <MobileNav />
    </div>
  );
};

export default App;
