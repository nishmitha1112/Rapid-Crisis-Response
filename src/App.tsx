import React, { useState } from 'react';
import { Shield, Activity, Clock, AlertOctagon, LogOut, Cpu, Zap, Radio } from 'lucide-react';
import EmergencyDashboard from './components/EmergencyDashboard';
import AdvancedIntelligence from './components/EmergencyDashboardAdvanced';
import EventSimulator from './components/EventSimulator';
import ThemeToggle from './components/ThemeToggle';
import LoginScreen from './components/LoginScreen';
import IdentityVerification from './components/IdentityVerification';
import GuestDashboard from './components/GuestDashboard';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import ResponderDashboard from './components/ResponderDashboard';
import { emergencyApi } from './services/api';
import { EmergencyEvent, EmergencyResponse } from './types';
import './index.css';

type UserRole = 'GUEST' | 'STAFF' | 'ADMIN' | 'RESPONDER' | null;

const App: React.FC = () => {
  const [response, setResponse] = useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [routingPreference, setRoutingPreference] = useState<'safest' | 'fastest'>('fastest');

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setResponse(null);
    setError(null);
  };

  const handleSimulate = async (event: EmergencyEvent) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await emergencyApi.processEvent(event);
      setResponse(result);
      if (event.routing_preference) {
        setRoutingPreference(event.routing_preference);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process emergency event');
      console.error('Error processing event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRouting = async (preference: 'safest' | 'fastest') => {
    if (!response) return;
    
    setLoading(true);
    try {
      const event: EmergencyEvent = {
        sos: response.log.input.sos,
        sensor: response.log.input.sensor,
        crowd: response.log.input.crowd,
        location: response.log.input.location,
        routing_preference: preference
      };
      
      const result = await emergencyApi.processEvent(event);
      setResponse(result);
      setRoutingPreference(preference);
    } catch (err) {
      console.error('Error updating routing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-all duration-700 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="mesh-bg opacity-50"></div>
      
      {/* 1. REFINED MISSION CONTROL HEADER */}
      {!response && (
        <header className="sticky top-0 z-[100] bg-[var(--bg-secondary)] border-b border-[var(--glass-border)] px-6 py-3 transition-colors duration-300">
          <div className="max-w-full mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-[#e8f0fe] rounded-lg">
                <Shield className="w-6 h-6 text-[#1a73e8]" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-medium tracking-tight text-[var(--text-primary)]">ResQAI Intelligence</h1>
                  <span className="px-2 py-0.5 bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium rounded-md">v4.2.0</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn && (
                <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-[var(--success-bg)] rounded-full">
                  <Activity className="w-4 h-4 text-[var(--success-text)]" />
                  <span className="text-sm font-medium text-[var(--success-text)]">System Healthy // {userRole || 'GUEST'}</span>
                </div>
              )}
              <div className="hidden lg:flex">
                <ThemeToggle />
              </div>

              {isLoggedIn && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-[#5f6368] rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 2. AUTH GATES */}
      <div className="relative z-10">
        {!isLoggedIn && <LoginScreen onLogin={() => setIsLoggedIn(true)} />}
        
        {isLoggedIn && !userRole && (
          <IdentityVerification onVerified={(role) => setUserRole(role)} />
        )}

        {/* 3. MAIN COMMAND CENTER */}
        {isLoggedIn && userRole && (
          <main className="relative p-8 md:p-12 max-w-full mx-auto animate-in fade-in duration-1000">
          <div className={`relative w-full grid grid-cols-1 ${!response ? 'xl:grid-cols-12' : 'xl:grid-cols-1'} gap-12`}>
            
            {/* SIMULATOR PANEL */}
            {!response && (
              <div className="xl:col-span-4 2xl:col-span-3 space-y-8">
                <EventSimulator onSimulate={handleSimulate} loading={loading} />
                
                {/* ERROR CONSOLE */}
                {error && (
                  <div className="bg-[#fce8e6] border border-[#ea4335] rounded-xl p-6 mb-8 animate-in slide-in-from-left duration-500">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertOctagon className="w-5 h-5 text-[#ea4335]" />
                      <h3 className="text-[#ea4335] font-medium text-base">System Error</h3>
                    </div>
                    <p className="text-sm text-[#202124] mb-4 bg-white p-3 rounded-lg border border-[#fce8e6]">{error}</p>
                    <div className="text-xs text-[#5f6368]">
                      <span className="font-medium">Troubleshooting:</span> Ensure the backend is active on Port 8000. 
                      Run <code className="bg-[#f8f9fa] border border-[#e0e0e0] px-1.5 py-0.5 rounded font-mono text-[#ea4335] mx-1">python backend/app.py</code>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMMAND VIEWPORT */}
            <div className={`${!response ? 'xl:col-span-8 2xl:col-span-9' : 'xl:col-span-1'}`}>
              {loading && (
                <div className="flex flex-col items-center justify-center h-[70vh] space-y-10">
                  <div className="relative">
                    <div className="absolute -inset-10 bg-blue-500/10 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="loading-spinner w-24 h-24 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-[var(--text-primary)] mb-3 uppercase tracking-tighter shimmer">Processing Intelligence</p>
                    <p className="text-sm text-[var(--text-secondary)] font-medium tracking-wide">Orchestrating multi-sector response protocols...</p>
                  </div>
                </div>
              )}
              
              {!loading && !response && (
                <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[60vh] bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl shadow-none">
                    <div className="mb-8 flex items-center justify-center">
                      <div className="w-24 h-24 bg-[#e8f0fe] rounded-full flex items-center justify-center">
                        <Radio className="w-12 h-12 text-[#1a73e8]" />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-medium text-[var(--text-primary)] mb-4 tracking-tight">
                      Neural Network Standby
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-base">
                      ResQAI Unified Command is scanning local sectors. Engage the tactical simulator to initiate emergency protocols.
                    </p>
                    
                    <div className="mt-8 flex items-center justify-center space-x-4">
                       <div className="flex items-center space-x-2 px-4 py-2 bg-[#E6F4EA] rounded-full">
                          <span className="text-xs font-medium text-[#137333]">IA Engine: Active</span>
                       </div>
                       <div className="flex items-center space-x-2 px-4 py-2 bg-[#e8f0fe] rounded-full">
                          <span className="text-xs font-medium text-[#1967d2]">Mesh: Connected</span>
                       </div>
                    </div>
                </div>
              )}
              
              {!loading && response && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                  {userRole === 'GUEST' && (
                    <GuestDashboard 
                      response={response} 
                      onUpdateRouting={handleUpdateRouting} 
                      currentPreference={routingPreference}
                      onLogout={handleLogout}
                    />
                  )}
                  {userRole === 'STAFF' && <StaffDashboard response={response} onLogout={handleLogout} />}
                  {userRole === 'ADMIN' && <AdminDashboard response={response} onLogout={handleLogout} />}
                  {userRole === 'RESPONDER' && <ResponderDashboard response={response} onLogout={handleLogout} />}
                </div>
              )}
            </div>
          </div>
        </main>
        )}
      </div>

      {/* 4. FOOTER */}
      {!response && (
        <footer className="relative z-10 bg-[var(--bg-secondary)] border-t border-[var(--glass-border)] py-6 px-8">
          <div className="max-w-[95%] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-[#e8f0fe] rounded-lg">
                <Shield className="w-5 h-5 text-[#1a73e8]" />
              </div>
              <div>
                <span className="text-sm font-medium text-[var(--text-primary)]">ResQAI Global Intelligence Hub</span>
                <p className="text-xs text-[var(--text-secondary)]">Enterprise Emergency Response Platform // v2.0</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--success-bg)] rounded-full">
                 <Activity className="w-3.5 h-3.5 text-[var(--success-text)]" />
                 <span className="text-xs font-medium text-[var(--success-text)]">Neural Mesh Operational</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--info-bg)] rounded-full">
                 <Clock className="w-3.5 h-3.5 text-[var(--info-text)]" />
                 <span className="text-xs font-medium text-[var(--info-text)]">Tactical Latency &lt; 12ms</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--warning-bg)] rounded-full">
                 <Zap className="w-3.5 h-3.5 text-[var(--warning-text)]" />
                 <span className="text-xs font-medium text-[var(--warning-text)]">AI Detection Active</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
