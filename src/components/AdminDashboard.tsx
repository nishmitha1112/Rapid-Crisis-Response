import React, { useState } from 'react';
import { 
  Shield, ShieldAlert, Radio, Activity, Globe, Zap, 
  Settings, Server, Cpu, Database, Network, Eye, 
  Lock, Unlock, Wind, Flame, Bell, Share2, 
  FileText, CheckCircle2, AlertOctagon, TrendingUp, 
  Map as MapIcon, Users, Crosshair, Terminal, 
  ChevronRight, Play, Power, RotateCcw, AlertTriangle, LogOut,
  History, Download, ShieldCheck, Fingerprint
} from 'lucide-react';
import { EmergencyResponse, AIRecommendation, SiteInfo } from '../types';
import EvacuationMap from './EvacuationMap';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';

interface AdminDashboardProps {
  response: EmergencyResponse;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ response, onLogout }) => {
  const [activeSite, setActiveSite] = useState(response.global_admin?.active_site_id || 'SITE_A');
  const [autonomousMode, setAutonomousMode] = useState(response.global_admin?.autonomous_mode || 'ASSISTED');
  const [escalationLevel, setEscalationLevel] = useState(response.global_admin?.escalation_level || 1);
  const [iotOverrides, setIotOverrides] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const admin = response.global_admin;
  if (!admin) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#3b82f6] font-medium  text-sm">Initializing Global Command Matrix...</p>
      </div>
    </div>
  );

  const toggleIot = (id: string) => {
    setIotOverrides(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getEscalationStyle = (level: number) => {
    switch (level) {
      case 1: return 'status-success border-none';
      case 2: return 'status-warning border-none';
      case 3: return 'status-critical border-none animate-pulse';
      default: return 'bg-slate-100 text-[var(--text-secondary)]';
    }
  };

  const handleAction = (action: string) => {
    addToast(`ADMIN ACTION: ${action}`, action.includes('EVACUATION') || action.includes('LOCKDOWN') ? 'alert' : 'success');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[#3b82f6]/30 pb-32 transition-colors duration-500 overflow-x-hidden relative">
      <div className="fixed inset-0 bg-transparent pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      
      {/* 1. GLOBAL STICKY COMMAND BAR */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-[var(--bg-primary)]/95 backdrop-blur-3xl border-b border-[var(--glass-border)] px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-10">
           <div className="flex items-center space-x-4">
              <div className="relative">
                 <div className="w-12 h-12 bg-[#3b82f6] rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30">
                    <Shield className="w-7 h-7 text-white" />
                 </div>
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full border-4 border-[#020617] animate-ping"></div>
              </div>
              <div>
                 <span className="block text-lg font-medium tracking-tight text-[var(--text-primary)]">Global Command</span>
                 <span className="text-sm text-[#3b82f6] font-medium ">Auth Level 7 // Tactical Overseer</span>
              </div>
           </div>
           
           <div className="h-8 w-px bg-[#374151]"></div>
           
           <div className="flex items-center space-x-4 bg-[var(--bg-secondary)] p-1.5 rounded-[1.25rem] border border-[var(--glass-border)]">
              {(['MANUAL', 'ASSISTED', 'AUTONOMOUS'] as const).map(mode => (
                <button 
                  key={mode}
                  onClick={() => setAutonomousMode(mode)}
                  className={`px-6 py-2 rounded-xl text-sm font-medium  transition-all transform active:scale-95 ${autonomousMode === mode ? 'bg-[#3b82f6] text-white shadow-xl' : 'text-[#6b7280] hover:text-[var(--text-secondary)]'}`}
                >
                   {mode}
                </button>
              ))}
           </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleAction('Switch to Backup Systems')}
                className="h-12 px-6 bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--glass-border)] rounded-2xl text-sm font-medium  transition-all flex items-center active:scale-95 shadow-lg"
              >
                 <RotateCcw className="w-4 h-4 mr-3 text-[#3b82f6]" />
                 <span>Backup</span>
              </button>
              <button 
                onClick={() => handleAction('BUILDING LOCKDOWN')}
                className="h-12 px-6 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-2xl text-sm font-medium  transition-all shadow-lg shadow-[#f59e0b]/20 active:scale-95"
              >
                 Lockdown
              </button>
              <button 
                onClick={() => handleAction('INITIATE FULL EVACUATION')}
                className="h-12 px-8 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-2xl text-sm font-medium  transition-all shadow-lg shadow-[#ef4444]/30 animate-pulse flex items-center space-x-3 active:scale-95"
              >
                 <AlertTriangle className="w-5 h-5" />
                 <span>Evacuate</span>
              </button>
           </div>

           <div className="h-10 w-px bg-[#374151] mx-2 hidden lg:block"></div>

           <div className="flex items-center space-x-4 bg-[var(--bg-secondary)] px-6 py-2.5 rounded-2xl border border-[var(--glass-border)] h-14 shadow-inner">
              <div className="flex flex-col items-end">
                 <span className="text-xs font-medium text-[#6b7280]  mb-1">Authority</span>
                 <span className="text-sm font-medium text-[#3b82f6] tracking-wider">Level 7</span>
              </div>
              <div className="h-6 w-px bg-[#374151]"></div>
              <ThemeToggle />
           </div>

           <button 
             onClick={onLogout}
             className="flex items-center justify-center w-12 h-12 hover:bg-[#ef4444]/10 rounded-2xl transition-all group border border-transparent"
           >
              <LogOut className="w-5 h-5 text-[#6b7280] group-hover:text-[#ef4444] transition-colors" />
           </button>
        </div>
      </div>

      <div className="pt-24 px-4 md:px-10 space-y-10 max-w-full mx-auto">
        
        {/* MULTI-SITE SELECTOR & ESCALATION */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
           <div className="flex items-center space-x-4 overflow-x-auto pb-4 custom-scrollbar">
              {admin.sites.map(site => (
                <button 
                  key={site.id}
                  onClick={() => setActiveSite(site.id)}
                  className={`flex-shrink-0 flex items-center space-x-6 p-6 rounded-[1.5rem] border transition-all transform active:scale-95 ${activeSite === site.id ? 'bg-[var(--bg-secondary)] border-[#3b82f6]/50 ' : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[#6b7280] hover:border-[#3b82f6]/40'}`}
                >
                   <div className={`w-3.5 h-3.5 rounded-full  ${site.status === 'CRITICAL' ? 'bg-[#ef4444] animate-pulse' : site.status === 'WARNING' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`}></div>
                   <div className="text-left">
                      <p className={`text-sm font-medium  leading-none mb-2 ${activeSite === site.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{site.name}</p>
                      <p className="text-sm font-medium opacity-60 ">{site.active_incidents} INCIDENTS</p>
                   </div>
                </button>
              ))}
           </div>

           <div className="flex items-center space-x-5 bg-[var(--bg-secondary)] p-2.5 rounded-[1.5rem] border border-[var(--glass-border)] shadow-inner">
              <span className="text-sm font-medium text-[#6b7280]  ml-5">Escalation State:</span>
              {[1, 2, 3].map(level => (
                <button 
                  key={level}
                  onClick={() => setEscalationLevel(level as any)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xs font-medium transition-all transform active:scale-90 ${escalationLevel === level ? getEscalationStyle(level as any) + ' shadow-lg scale-110' : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[#6b7280] hover:text-[var(--text-secondary)]'}`}
                >
                   L{level}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          
          {/* CENTER: UNIFIED VISUALIZATION & RECOMMENDATIONS */}
          <div className="col-span-12 xl:col-span-8 space-y-10">
             
             {/* UNIFIED TACTICAL MAP */}
             <div className="card p-0 overflow-hidden relative border-[var(--glass-border)] shadow-sm rounded-[3rem]">
                <div className="h-[750px] w-full ">
                   <EvacuationMap response={response} />
                </div>
                
             </div>

             {/* MAP CONTROLS & LEGEND */}
             <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--glass-border)] shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                         <MapIcon className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <span className="text-sm font-medium  text-[var(--text-primary)]">Tactical Layer Control</span>
                   </div>
                   <div className="flex flex-wrap gap-3">
                      {['Staff', 'Guests', 'Hazards', 'Sensors', 'Systems'].map(layer => (
                        <button key={layer} className="px-5 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-sm font-medium  text-[#6b7280] hover:text-[var(--text-primary)] hover:border-[#3b82f6]/40 transition-all">
                           {layer}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* APPROVE & EXECUTE LAYER */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {admin.recommendations.map((rec, i) => (
                  <div key={rec.id} className="bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl animate-in slide-in-from-bottom duration-700 hover:border-[#3b82f6]/40 transition-all group" style={{ animationDelay: `${i * 150}ms` }}>
                     <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                           <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                              <Zap className="w-4 h-4 text-[#3b82f6]" />
                           </div>
                           <span className="text-sm font-medium text-[#3b82f6] ">Proposal</span>
                        </div>
                        <span className="text-sm font-medium text-[#6b7280] ">{rec.confidence}% REL</span>
                     </div>
                     <h4 className="text-sm font-medium text-[var(--text-primary)] tracking-tight mb-3 leading-tight">{rec.title}</h4>
                     <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 font-bold tracking-tight">{rec.description}</p>
                     <div className="flex items-center justify-between pt-6 border-t border-[var(--glass-border)]">
                        <span className="text-sm font-medium text-[#10b981] ">{rec.impact}</span>
                        <button 
                            onClick={() => handleAction(`EXECUTE RECOMMENDATION: ${rec.title}`)}
                            className="px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium  rounded-xl transition-all shadow-lg shadow-[#3b82f6]/20 transform active:scale-95"
                        >
                            EXECUTE
                        </button>
                     </div>
                  </div>
                ))}
             </div>

             {/* PREDICTIVE SIMULATION MODE */}
             <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[3rem]">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                         <TrendingUp className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">Outcome Matrix</h2>
                   </div>
                   <div className="flex items-center space-x-3 bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-sm font-medium text-[#6b7280] ">Horizon:</span>
                      <span className="text-sm font-medium text-[var(--text-primary)] ">{admin.predictive_sim.time_horizon}</span>
                   </div>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-[#ef4444]">
                         <Flame className="w-4 h-4" />
                         <span className="text-sm font-medium ">Propagation</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed tracking-tight italic border-l-2 border-[#ef4444]/30 pl-6">{admin.predictive_sim.fire_prediction}</p>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-[#10b981]">
                         <Users className="w-4 h-4" />
                         <span className="text-sm font-medium ">Civilian Flow</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed tracking-tight italic border-l-2 border-[#10b981]/30 pl-6">{admin.predictive_sim.evac_outcome}</p>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-[#f59e0b]">
                         <Crosshair className="w-4 h-4" />
                         <span className="text-sm font-medium ">Bottlenecks</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed tracking-tight italic border-l-2 border-[#f59e0b]/30 pl-6">{admin.predictive_sim.bottleneck_prediction}</p>
                   </div>
                </div>
 
                <div className="mt-10 pt-8 border-t border-[var(--glass-border)] flex items-center justify-between">
                   <div className="flex space-x-10">
                      <div className="flex flex-col">
                         <span className="text-sm font-medium text-[#6b7280]  mb-1">Est. Clear</span>
                         <span className="text-xl font-medium text-[var(--text-primary)]">12:45 <span className="text-sm text-[#10b981] ml-2">(-3M)</span></span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-medium text-[#6b7280]  mb-1">Risk Factor</span>
                         <span className="text-xl font-medium text-[#10b981]">STABLE</span>
                      </div>
                   </div>
                   <button 
                      onClick={() => handleAction('Run Full Simulation')}
                      className="px-8 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-[1.5rem] text-sm font-medium  transition-all shadow-xl shadow-[#3b82f6]/20 flex items-center space-x-4 transform active:scale-95"
                   >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Execute Full Simulation</span>
                   </button>
                </div>
             </div>
          </div>

          {/* RIGHT SIDEBAR: SYSTEM HEALTH & IOT GRID */}
          <div className="col-span-12 xl:col-span-4 space-y-10">
             
             {/* SYSTEM HEALTH MATRIX */}
             <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[3rem]">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                         <Server className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">System Health</h2>
                   </div>
                   <div className="flex items-center space-x-3 bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--glass-border)]">
                      <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse "></div>
                      <span className="text-sm font-medium text-[#10b981] ">Global Sync</span>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-3 gap-4">
                      <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl text-center group hover:border-[#10b981]/30 transition-all">
                         <p className="text-xs font-medium text-[#6b7280]  mb-2">Online</p>
                         <p className="text-2xl font-medium text-[#10b981]">{admin.system_health.sensors.online}</p>
                      </div>
                      <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl text-center group hover:border-[#ef4444]/30 transition-all">
                         <p className="text-xs font-medium text-[#6b7280]  mb-2">Offline</p>
                         <p className="text-2xl font-medium text-[#ef4444]">{admin.system_health.sensors.offline}</p>
                      </div>
                      <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl text-center group hover:border-[#f59e0b]/30 transition-all">
                         <p className="text-xs font-medium text-[#6b7280]  mb-2">Faulty</p>
                         <p className="text-2xl font-medium text-[#f59e0b]">{admin.system_health.sensors.faulty}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl hover:border-[#3b82f6]/30 transition-all">
                      <div className="flex items-center space-x-4">
                         <Network className="w-5 h-5 text-[#3b82f6]" />
                         <span className="text-sm font-medium  text-[var(--text-secondary)]">Net Latency</span>
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)] ">{admin.system_health.network.latency}</span>
                   </div>

                   <div className="flex items-center justify-between p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl hover:border-[#3b82f6]/30 transition-all">
                      <div className="flex items-center space-x-4">
                         <Eye className="w-5 h-5 text-[#3b82f6]" />
                         <span className="text-sm font-medium  text-[var(--text-secondary)]">Vis-Intel Feeds</span>
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)] ">{admin.system_health.cameras.active} / {admin.system_health.cameras.total} ACTIVE</span>
                   </div>
                </div>
             </div>

             {/* FULL IOT CONTROL GRID */}
             <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[3rem]">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                         <Settings className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">IoT Grid Control</h2>
                   </div>
                </div>
 
                <div className="space-y-4">
                   {[
                     { id: 'fire', label: 'Fire Suppression', icon: Flame, color: '#ef4444' },
                     { id: 'doors', label: 'External Doors', icon: Lock, color: '#f59e0b' },
                     { id: 'hvac', label: 'HVAC Ventilation', icon: Wind, color: '#3b82f6' },
                     { id: 'elevators', label: 'Elevator Override', icon: Cpu, color: '#3b82f6' },
                     { id: 'power', label: 'Backup Power', icon: Zap, color: '#10b981' },
                     { id: 'comms', label: 'Broadcast PA', icon: Bell, color: '#3b82f6' }
                   ].map(sys => (
                      <div key={sys.id} className="flex items-center justify-between p-6 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl group hover:border-[#3b82f6]/40 transition-all">
                         <div className="flex items-center space-x-5">
                            <sys.icon className={`w-6 h-6 transition-transform group-hover:scale-110`} style={{ color: sys.color }} />
                            <div>
                               <p className="text-sm font-medium text-[var(--text-primary)] tracking-tight">{sys.label}</p>
                               <p className="text-sm font-medium text-[#6b7280]  mt-1">SYS_ID: {sys.id.toUpperCase()}_v1</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => toggleIot(sys.id)}
                           className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner border border-[var(--glass-border)] ${iotOverrides[sys.id] ? 'bg-[#1a73e8]' : 'bg-[#dadce0] dark:bg-[#3c4043]'}`}
                         >
                            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-500 shadow-md ${iotOverrides[sys.id] ? 'left-[26px]' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                   ))}
                </div>
             </div>

             {/* COMPLIANCE & AUDIT */}
             <div className="card bg-[#10b981]/5 border-[#10b981]/20 shadow-sm rounded-[3rem]">
                <div className="flex items-center space-x-4 mb-10">
                   <div className="p-2 bg-[#10b981]/10 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-[#34d399]" />
                   </div>
                   <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">Audit Protocol</h2>
                </div>
                
                <div className="space-y-6 mb-10">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-secondary)] ">OSHA Alignment</span>
                      <span className="text-sm font-medium text-[#34d399]">{admin.compliance.osha_alignment}%</span>
                   </div>
                   <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--glass-border)]">
                      <div className="h-full bg-[#10b981] " style={{ width: `${admin.compliance.osha_alignment}%` }}></div>
                   </div>
                   <div className="flex items-center justify-between p-5 bg-[var(--bg-tertiary)]/40 rounded-2xl border border-[#10b981]/10 group hover:border-[#10b981]/30 transition-all">
                      <Fingerprint className="w-5 h-5 text-[#10b981]" />
                      <span className="text-sm font-mono text-[#6b7280] truncate ml-4 group-hover:text-[var(--text-secondary)]">HASH: {admin.compliance.audit_log_hash}</span>
                   </div>
                </div>
 
                <button 
                   onClick={() => handleAction('Export Compliance PDF')}
                   className="w-full py-5 bg-[#10b981] hover:bg-[#059669] text-white rounded-[1.5rem] text-sm font-medium  transition-all flex items-center justify-center space-x-4 shadow-xl shadow-[#10b981]/20 transform active:scale-95"
                >
                   <Download className="w-5 h-5" />
                   <span>Export Compliance Matrix</span>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
