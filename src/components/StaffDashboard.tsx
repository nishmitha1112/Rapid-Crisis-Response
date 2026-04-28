import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, Navigation, Compass, Map as MapIcon, 
  Users, Activity, Flame, Wind, Lock, Unlock,
  MessageSquare, Mic, AlertTriangle, CheckCircle2, 
  Clock, BarChart3, Radio, HardDrive, Settings, 
  Eye, Search, Bell, Share2, Layers, Crosshair,
  TrendingUp, AlertOctagon, Terminal, ClipboardList, MapPin, Zap, X, Maximize2, LogOut
} from 'lucide-react';
import { EmergencyResponse, StaffMember, ZoneStatus, CommandCenterData } from '../types';
import EvacuationMap from './EvacuationMap';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';

interface StaffDashboardProps {
  response: EmergencyResponse;
  onLogout: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ response, onLogout }) => {
  const [mode, setMode] = useState<'command' | 'field'>('command');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [commsChannel, setCommsChannel] = useState('Tactical-1');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [tacticalMessage, setTacticalMessage] = useState('');
  const [iotStatus, setIotStatus] = useState({
    fire_suppression: false,
    ventilation: 'normal',
    door_locks: 'auto',
    elevators: 'emergency_stop'
  });
  const [selectedCamera, setSelectedCamera] = useState<any | null>(null);

  const { addToast } = useToast();
  const cc = response.command_center;
  
  const [tasks, setTasks] = useState([
    { id: 'T-882', task: 'Secure South Exit 4', owner: 'Lt. Miller', status: 'pending', due_time: '2m', overdue: false },
    { id: 'T-883', task: 'Assist Triage Floor 2', owner: 'Officer Chen', status: 'in_progress', due_time: '1m', overdue: true },
    { id: 'T-884', task: 'Deploy Smoke Curtain Z-3', owner: 'Staff Sarah', status: 'done', due_time: '5m', overdue: false },
  ]);

  const [timeline, setTimeline] = useState([
    { time: '14:22', event: 'Zone B Perimeter Breach', type: 'auto' as const },
    { time: '14:20', event: 'Water Mist System Activated', type: 'auto' as const },
    { time: '14:18', event: 'Manual Override: Elevator E4', type: 'manual' as const },
  ]);

  const transcriptRef = React.useRef('');

  const handleSendTactical = (msg?: string) => {
    const finalMsg = msg || tacticalMessage;
    if (!finalMsg.trim()) return;
    addToast(`TACTICAL UPDATE: ${finalMsg}`, 'info');
    
    const logEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: `COMMAND: ${finalMsg}`,
      type: 'manual' as const
    };
    setTimeline(prev => [logEntry, ...prev]);
    setTacticalMessage('');
  };

  const recognitionRef = React.useRef<any>(null);

  const toggleVoiceCapture = () => {
    if (isTransmitting && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Speech recognition not supported on this device.", "alert");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsTransmitting(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => (result as any).transcript)
        .join('');
      setTacticalMessage(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setIsTransmitting(false);
      if (transcriptRef.current.trim()) {
        handleSendTactical(transcriptRef.current);
        transcriptRef.current = '';
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setIsTransmitting(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignTask = () => {
    if (!newTaskText || !selectedStaffId || !cc) return;
    const staff = cc.staff.find((s: StaffMember) => s.id === selectedStaffId);
    const newTask = {
      id: `T-${Math.floor(Math.random() * 1000)}`,
      task: newTaskText,
      owner: staff?.name || 'Unknown',
      status: 'pending' as const,
      due_time: '5m',
      overdue: false
    };
    setTasks(prev => [newTask, ...prev]);
    addToast(`TASK DEPLOYED: ${staff?.name}`, 'success');
    setIsAssignModalOpen(false);
    setNewTaskText('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-rose-500';
      case 'moderate': return 'bg-amber-500';
      case 'stable': return 'bg-emerald-500';
      case 'busy': return 'text-amber-500 border-amber-500/30';
      case 'available': return 'text-emerald-500 border-emerald-500/30';
      default: return 'text-slate-500 border-slate-500/30';
    }
  };

  const handleAction = (action: string) => {
    addToast(`ACTION: ${action}`, action.includes('EVACUATION') ? 'alert' : 'info');
    const logEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: `EMERGENCY ACTION: ${action}`,
      type: 'manual' as const
    };
    setTimeline(prev => [logEntry, ...prev]);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'done' ? 'pending' : 'done' };
      }
      return t;
    }));
  };

  if (!cc) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#3b82f6] font-medium  text-sm">Initializing Tactical Command...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[#3b82f6]/30 transition-colors duration-500 overflow-x-hidden relative">
      <div className="fixed inset-0 bg-transparent pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      
      {/* 1. QUICK ACTION STICKY BAR */}
      <div className="fixed top-0 left-0 right-0 z-[110] bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-lg shadow-[#3b82f6]/30">
                 <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-medium tracking-tight text-[var(--text-primary)]">Tactical Command <span className="text-[#3b82f6]">v4.2</span></span>
           </div>
           <div className="h-6 w-px bg-[#374151]"></div>
           <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-sm font-medium text-[var(--text-secondary)] ">Operational // Latency: 14ms</span>
           </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleAction('Broadcast Message')}
                className="h-12 px-6 bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--glass-border)] rounded-2xl text-sm font-medium  transition-all active:scale-95 shadow-lg"
              >
                 Broadcast
              </button>
              <button 
                onClick={() => handleAction('Close All Zones')}
                className="h-12 px-6 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-2xl text-sm font-medium  transition-all shadow-lg shadow-[#f59e0b]/20 active:scale-95"
              >
                 Lockdown
              </button>
              <button 
                onClick={() => handleAction('INITIATE FULL EVACUATION')}
                className="h-12 px-8 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-2xl text-sm font-medium  transition-all shadow-lg shadow-[#ef4444]/30 animate-pulse flex items-center space-x-2 active:scale-95"
              >
                 <ShieldAlert className="w-4 h-4" />
                 <span>Evacuate</span>
              </button>
           </div>

           <div className="h-10 w-px bg-[#374151] mx-2 hidden lg:block"></div>

           <div className="flex items-center space-x-4 bg-[var(--bg-secondary)] px-6 py-2.5 rounded-2xl border border-[var(--glass-border)] h-14 shadow-inner">
              <div className="flex flex-col items-end">
                 <span className="text-xs font-medium text-[#6b7280]  mb-1">Status</span>
                 <span className="text-sm font-medium text-[#10b981] tracking-wider">Online</span>
              </div>
              <div className="h-6 w-px bg-[#374151]"></div>
              <ThemeToggle />
           </div>

           <button 
             onClick={onLogout}
             className="flex items-center space-x-3 h-11 px-5 hover:bg-[#ef4444]/5 rounded-xl transition-all group border border-transparent"
           >
              <LogOut className="w-4 h-4 text-[#6b7280] group-hover:text-[#ef4444] transition-colors" />
              <span className="text-sm text-[#6b7280] group-hover:text-[#ef4444] font-medium  transition-colors">
                 Exit
              </span>
           </button>
        </div>
      </div>

      <div className="pt-24 px-4 md:px-10 space-y-12 max-w-full mx-auto">
        
        {/* HEADER & MODE TOGGLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-4xl font-medium tracking-tight text-[var(--text-primary)]">Operational Headquarters</h1>
              <p className="text-[var(--text-secondary)] font-medium mt-1">Incident ID: {response.incident_id || 'RQ-2024-001'} // {response.log.input.location}</p>
           </div>
           
           <div className="flex bg-[var(--bg-tertiary)] p-1.5 rounded-2xl border border-[var(--glass-border)] shadow-inner">
              <button 
                onClick={() => setMode('command')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${mode === 'command' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs font-medium ">Command Mode</span>
              </button>
              <button 
                onClick={() => setMode('field')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${mode === 'field' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                <Radio className="w-4 h-4" />
                <span className="text-xs font-medium ">Field Mode</span>
              </button>
           </div>
        </div>

        {mode === 'command' ? (
          <div className="grid grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: TACTICAL MAP & GUEST FLOW */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
                {/* LIVE SURVEILLANCE HUB */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { id: 'CAM-04', loc: 'Lobby North', status: 'active', color: 'text-[#10b981]' },
                     { id: 'CAM-09', loc: 'Bank B', status: 'active', color: 'text-[#10b981]' },
                     { id: 'CAM-12', loc: 'South Exit', status: 'warning', color: 'text-[#f59e0b]' },
                     { id: 'CAM-21', loc: 'Atrium', status: 'critical', color: 'text-[#ef4444]' }
                   ].map((cam) => (
                     <div 
                        key={cam.id} 
                        onClick={() => setSelectedCamera(cam)}
                        className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-lg group cursor-zoom-in hover:border-[#3b82f6]/50 transition-all"
                     >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800')] bg-cover opacity-30 contrast-125 saturate-0 group-hover:scale-105 transition-transform duration-[10s] filter brightness-[0.8]"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 via-transparent to-[#020617]/80"></div>
                        
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                           <div className="flex items-center space-x-1.5">
                              <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-pulse "></div>
                              <span className="text-[7px] font-medium text-[var(--text-primary)]/80 ">{cam.id}</span>
                           </div>
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                           <span className="text-[6px] font-medium text-[#6b7280]  leading-none">{cam.loc}</span>
                           <div className={`px-1.5 py-0.5 rounded-sm bg-[var(--bg-primary)]/80 border border-[var(--glass-border)] flex items-center space-x-1`}>
                              <div className={`w-1 h-1 rounded-full ${cam.color.replace('text-', 'bg-')}`}></div>
                              <span className={`text-[6px] font-medium  text-[var(--text-primary)]`}>{cam.status}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--glass-border)] overflow-hidden relative shadow-sm">
                   <div className="h-[550px] w-full ">
                      <EvacuationMap response={response} />
                   </div>
                   
                </div>
               
                {/* LIVE STAFF OVERLAY LEGEND */}
                <div className="bg-[var(--bg-secondary)] p-5 px-8 rounded-2xl border border-[var(--glass-border)] shadow-xl flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                         <Users className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <span className="text-sm font-medium  text-[var(--text-primary)]">Field Agents Tracking: <span className="text-[#3b82f6]">{cc.staff.length} Active</span></span>
                   </div>
                   <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-[#6b7280] ">GPS Sync Active</span>
                   </div>
                </div>
                   
                {/* LIVE ZONE COUNTERS */}
                <div className="relative grid grid-cols-4 gap-4 mt-8">
                   {cc.zones.map((zone: ZoneStatus) => (
                     <div key={zone.id} className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--glass-border)] hover:border-[#3b82f6]/40 transition-all cursor-crosshair group shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-sm font-medium text-[#6b7280] group-hover:text-[var(--text-secondary)]  transition-colors">{zone.name}</span>
                           <span className={`w-2 h-2 rounded-full  ${getStatusColor(zone.status)}`}></span>
                        </div>
                        <div className="flex items-end justify-between">
                           <span className="text-2xl font-medium text-[var(--text-primary)] tracking-tight leading-none">{zone.guests_count}</span>
                           <span className="text-sm font-medium text-[#6b7280]  mb-0.5">GUESTS</span>
                        </div>
                     </div>
                   ))}
                </div>

               {/* INCIDENT COMMAND PANEL */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card bg-gradient-to-br from-rose-500/5 to-transparent">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium  text-[var(--text-secondary)]">Fire Spread Status</h3>
                        <Flame className="w-4 h-4 text-rose-500" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-end justify-between">
                           <span className="text-2xl font-medium text-[var(--text-primary)]">{cc.fire_spread.rate}</span>
                           <span className="text-xs font-bold text-rose-400 mb-1">EXPANSION RATE</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {cc.fire_spread.affected_zones.map((z: string) => (
                             <span key={z} className="status-critical px-2 py-1 text-xs font-medium  rounded-lg">
                                {z}
                             </span>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="card bg-gradient-to-br from-blue-500/5 to-transparent">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium  text-[var(--text-secondary)]">Evacuation Progress</h3>
                        <Activity className="w-4 h-4 text-blue-500" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-end justify-between">
                           <span className="text-2xl font-medium text-[var(--text-primary)]">{cc.evacuation_stats.progress_percentage}%</span>
                           <span className="text-xs font-bold text-blue-400 mb-1">{cc.evacuation_stats.evacuated_count} / {cc.evacuation_stats.total_guests} GUESTS</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-blue-500  transition-all duration-1000" 
                             style={{ width: `${cc.evacuation_stats.progress_percentage}%` }}
                           ></div>
                        </div>
                     </div>
                  </div>

                  <div className="card bg-gradient-to-br from-emerald-500/5 to-transparent">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium  text-[var(--text-secondary)]">Response Metrics (Live)</h3>
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-end justify-between">
                           <span className="text-2xl font-medium text-[var(--text-primary)]">{response.response_time}</span>
                           <span className="text-xs font-bold text-emerald-400 mb-1">AVG RESPONSE</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium ">
                           <span className="text-[var(--text-muted)]">SLA STATUS:</span>
                           <span className="text-emerald-500">ON SCHEDULE</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* RESOURCE & INFRASTRUCTURE MATRIX (NEW) */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Network Node-A', val: '100%', status: 'Online', color: 'text-emerald-500' },
                    { label: 'Water Pressure', val: '4.2 bar', status: 'Stable', color: 'text-emerald-500' },
                    { label: 'Backdoor-4', val: 'LOCKED', status: 'Secure', color: 'text-blue-500' },
                    { label: 'HVA-Zone 2', val: 'REDUCED', status: 'Manual', color: 'text-amber-500' }
                  ].map((item, i) => (
                    <div key={i} className="card p-5 border-l-4 border-l-blue-500 shadow-sm">
                       <p className="text-xs font-medium text-[var(--text-secondary)]  mb-1">{item.label}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{item.val}</span>
                          <span className={`text-[7px] font-medium ${item.color}`}>{item.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* RIGHT COLUMN: STAFF tracking & AI INTEL */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               
                {/* STAFF TRACKING */}
                <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[2.5rem]">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                         <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                            <Crosshair className="w-5 h-5 text-[#3b82f6]" />
                         </div>
                         <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">Field Ops</h2>
                      </div>
                      <span className="text-sm font-medium text-[#6b7280] ">{cc.staff.length} AGENTS</span>
                   </div>
 
                   <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-3">
                      {cc.staff.map((staff: StaffMember) => (
                        <div key={staff.id} className="p-5 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl hover:border-[#3b82f6]/40 transition-all group cursor-pointer relative overflow-hidden">
                           <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                 <div className="relative">
                                    <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center font-medium text-xs border border-[var(--glass-border)] group-hover:border-[#3b82f6]/50 transition-colors text-[var(--text-primary)]">
                                       {staff.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#111827]  ${staff.status === 'available' ? 'bg-[#10b981]' : staff.status === 'busy' ? 'bg-[#f59e0b]' : 'bg-[#ef4444] animate-pulse'}`}></div>
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-medium text-[var(--text-primary)] tracking-tight">{staff.name}</h4>
                                    <p className="text-sm text-[#6b7280] font-medium  mt-0.5">{staff.role}</p>
                                 </div>
                              </div>
                              <div className={`px-2.5 py-1 rounded-lg text-xs font-medium  border transition-colors ${getStatusColor(staff.status)}`}>
                                 {staff.status}
                              </div>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm font-bold text-[var(--text-secondary)]">
                                 <MapPin className="w-3.5 h-3.5 mr-2 text-[#3b82f6]/60" />
                                 {staff.location}
                              </div>
                              {staff.sub_status && <span className="text-sm font-medium text-[#3b82f6]  animate-pulse">{staff.sub_status}</span>}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* AI DECISION SUPPORT */}
                <div className="card bg-[#ef4444]/5 border-[#ef4444]/20 shadow-sm rounded-[2.5rem]">
                   <div className="flex items-center space-x-4 mb-8">
                      <div className="p-2 bg-[#ef4444]/10 rounded-xl">
                         <Zap className="w-5 h-5 text-[#f87171]" />
                      </div>
                      <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">AI Tactical Intel</h2>
                   </div>
                   
                   <div className="space-y-4">
                      {cc.ai_suggestions.map((s: string, i: number) => (
                        <div key={i} className="flex items-start space-x-4 p-5 bg-[var(--bg-tertiary)]/40 border border-[#ef4444]/10 rounded-2xl hover:border-[#ef4444]/30 transition-all group animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                           <div className="w-2 h-2 rounded-full bg-[#ef4444] mt-2 flex-shrink-0 animate-pulse "></div>
                           <p className="text-xs font-bold leading-relaxed text-[var(--text-secondary)] tracking-tight">{s}</p>
                        </div>
                      ))}
                      
                      <div className="mt-8 pt-8 border-t border-[var(--glass-border)]">
                         <div className="flex items-center space-x-3 mb-4">
                            <AlertOctagon className="w-5 h-5 text-[#ef4444]" />
                            <span className="text-sm font-medium text-[#f87171] ">Failure Alerts</span>
                         </div>
                         <div className="bg-[#ef4444] text-white p-4 rounded-2xl text-sm font-medium  shadow-lg shadow-[#ef4444]/20 animate-pulse">
                            Critical: Sector-3 Unresponsive // 02:45
                         </div>
                      </div>
                   </div>
                </div>

                {/* SYSTEM CONTROLS */}
                <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[2.5rem]">
                   <div className="flex items-center space-x-4 mb-8">
                      <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                         <Settings className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">IoT Control</h2>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'suppression', label: 'Suppression', icon: Flame, active: iotStatus.fire_suppression, color: '#ef4444', toggle: () => setIotStatus(prev => ({ ...prev, fire_suppression: !prev.fire_suppression })), status: iotStatus.fire_suppression ? 'ACTIVE' : 'READY' },
                        { id: 'ventilation', label: 'Ventilation', icon: Wind, active: iotStatus.ventilation === 'smoke_extraction', color: '#3b82f6', toggle: () => setIotStatus(prev => ({ ...prev, ventilation: prev.ventilation === 'normal' ? 'smoke_extraction' : 'normal' })), status: iotStatus.ventilation === 'smoke_extraction' ? 'EXTRACT' : 'NORMAL' },
                        { id: 'locks', label: 'Locks', icon: Lock, active: false, color: '#f59e0b', toggle: () => {}, status: 'SECURE' },
                        { id: 'elevators', label: 'Elevators', icon: Zap, active: false, color: '#10b981', toggle: () => {}, status: 'EMERGENCY' }
                      ].map((item) => (
                        <button 
                          key={item.id}
                          onClick={item.toggle}
                          className={`flex flex-col items-center p-6 rounded-2xl border transition-all transform active:scale-95 group ${item.active ? 'bg-[var(--bg-secondary)] border-[#3b82f6]/50' : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] hover:border-[#3b82f6]/40'}`}
                        >
                           <item.icon className={`w-6 h-6 mb-3 transition-transform group-hover:scale-110 ${item.active ? 'text-[#3b82f6]' : 'text-[#6b7280]'}`} style={{ color: item.active ? item.color : undefined }} />
                           <span className="text-sm font-medium  text-[#6b7280] mb-2">{item.label}</span>
                           <span className={`text-sm font-medium  ${item.active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{item.status}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
 
             {/* FULL WIDTH: OPERATIONAL TASKS & TIMELINE */}
             <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
                
                {/* TASK ASSIGNMENT */}
                <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[2.5rem]">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center space-x-4">
                         <div className="p-2 bg-[#10b981]/10 rounded-xl">
                            <ClipboardList className="w-6 h-6 text-[#10b981]" />
                         </div>
                         <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">Task Matrix</h2>
                      </div>
                       <button 
                          onClick={() => setIsAssignModalOpen(true)}
                          className="text-sm font-medium text-[#34d399]  border border-[#10b981]/30 px-6 py-3 rounded-xl hover:bg-[#10b981]/10 transition-all shadow-lg"
                       >
                          + New Objective
                       </button>
                   </div>
                   <div className="space-y-4">
                      {tasks.map(task => (
                        <div key={task.id} className="grid grid-cols-12 items-center gap-6 p-6 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl group hover:border-[#3b82f6]/30 transition-all">
                           <div className="col-span-1 flex justify-center">
                              <div className={`w-3.5 h-3.5 rounded-full  ${task.status === 'done' ? 'bg-[#10b981]' : task.overdue ? 'bg-[#ef4444] animate-pulse' : 'bg-[#374151]'}`}></div>
                           </div>
                           <div className="col-span-5">
                              <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors tracking-tight leading-tight">{task.task}</p>
                              <p className="text-sm text-[#6b7280] font-medium  mt-2">ID: {task.id}</p>
                           </div>
                           <div className="col-span-3">
                              <div className="flex items-center space-x-3">
                                 <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-sm font-medium border border-[var(--glass-border)] text-[var(--text-primary)]">
                                    {task.owner.split(' ').map(n => n[0]).join('')}
                                 </div>
                                 <span className="text-sm font-medium text-[var(--text-secondary)] ">{task.owner}</span>
                              </div>
                           </div>
                           <div className="col-span-3 text-right">
                              <button 
                                onClick={() => handleToggleTaskStatus(task.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium  transition-all ${
                                  task.status === 'done' ? 'bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20' : 'bg-[var(--bg-secondary)] text-[#6b7280] border border-[var(--glass-border)] hover:text-[var(--text-primary)] hover:border-[#3b82f6]/40'
                                }`}
                              >
                                 {task.status.replace('_', ' ')}
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
 
                {/* INCIDENT TIMELINE */}
                <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[2.5rem]">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center space-x-4">
                         <div className="p-2 bg-[#3b82f6]/10 rounded-xl">
                            <Terminal className="w-6 h-6 text-[#3b82f6]" />
                         </div>
                         <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">Incident Log</h2>
                      </div>
                   </div>
 
                   <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-3">
                      {timeline.map((entry, i) => (
                        <div key={i} className="flex space-x-8 group">
                           <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-sm font-medium border transition-all ${entry.type === 'auto' ? 'bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]' : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[#6b7280]'}`}>
                                 {entry.time}
                              </div>
                              <div className="w-px h-full bg-[#374151] mt-3"></div>
                           </div>
                           <div className="pb-8 flex-1">
                              <p className={`text-sm font-medium tracking-tight leading-relaxed ${entry.type === 'auto' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}>{entry.event}</p>
                              <div className="flex items-center space-x-3 mt-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${entry.type === 'auto' ? 'bg-[#3b82f6]' : 'bg-[#6b7280]'}`}></div>
                                 <p className="text-sm font-medium  text-[#6b7280]">{entry.type === 'auto' ? 'AI_CORE' : 'CMD_STAFF'}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        ) : (
          /* FIELD MODE */
          <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 pb-40">
             <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-[3rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"></div>
                <div className="w-24 h-24 bg-[#3b82f6] rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-[#3b82f6]/30 border-4 border-[var(--glass-border)]">
                   <Radio className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-medium text-[var(--text-primary)] tracking-tight mb-3">Field Uplink</h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium ">Sector: <span className="text-[#3b82f6]">{response.log.input.location}</span></p>
             </div>
             
             <div className="space-y-6">
                <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] rounded-[2.5rem] p-10 shadow-2xl">
                   <h3 className="text-sm font-medium text-[#6b7280]  mb-8">Primary Objective</h3>
                   <div className="flex items-start space-x-6">
                      <div className="p-4 bg-[#10b981]/10 rounded-[1.5rem]">
                         <Shield className="w-8 h-8 text-[#10b981]" />
                      </div>
                      <div>
                         <p className="text-xl font-medium text-[var(--text-primary)] tracking-tight leading-tight">Secure South Wing // Floor 3</p>
                         <p className="text-xs text-[var(--text-secondary)] mt-2 font-bold  leading-relaxed">Estimated 12 civilian signatures remaining in your sector.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleAction('Objective Completed: Evacuate Floor 3 South Wing')}
                     className="w-full mt-10 py-6 bg-[#10b981] hover:bg-[#059669] text-white rounded-[1.5rem] text-xs font-medium  transition-all shadow-lg shadow-[#10b981]/20 transform active:scale-95"
                   >
                      Complete Objective
                   </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <button 
                     onClick={() => handleAction('EMERGENCY SOS SIGNAL')}
                     className="flex flex-col items-center justify-center p-10 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-[2.5rem] group transition-all hover:bg-[#ef4444]/10 active:scale-95 shadow-xl"
                   >
                      <ShieldAlert className="w-12 h-12 text-[#ef4444] mb-4 group-hover:scale-110 transition-transform " />
                      <span className="text-sm font-medium text-[#f87171] ">Tactical SOS</span>
                   </button>
                   <button 
                     onClick={() => handleAction('Status Report Requested')}
                     className="flex flex-col items-center justify-center p-10 bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-[2.5rem] group transition-all hover:bg-[#3b82f6]/10 active:scale-95 shadow-xl"
                   >
                      <MessageSquare className="w-12 h-12 text-[#3b82f6] mb-4 group-hover:scale-110 transition-transform " />
                      <span className="text-sm font-medium text-[#3b82f6] ">Comms Check</span>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* COMMS HUB BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-t border-[var(--glass-border)] px-8 py-5 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         <div className="flex items-center space-x-10">
            <div className="flex flex-col">
               <span className="text-xs font-medium text-[#6b7280]  mb-1">Tactical Net</span>
               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse "></div>
                  <span className="text-xs font-medium text-[var(--text-primary)] ">{commsChannel}</span>
               </div>
            </div>
            
            <div className="flex items-center bg-[var(--bg-secondary)] p-1.5 rounded-[1.25rem] border border-[var(--glass-border)]">
               {['Tactical-1', 'Fire-Net', 'Med-Base'].map(ch => (
                 <button 
                   key={ch}
                   onClick={() => setCommsChannel(ch)}
                   className={`px-5 py-2 rounded-xl text-sm font-medium  transition-all ${commsChannel === ch ? 'bg-[#3b82f6] text-white shadow-xl' : 'text-[#6b7280] hover:text-[var(--text-secondary)]'}`}
                 >
                    {ch}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex items-center space-x-6 flex-1 max-w-2xl mx-12">
             <div className="flex items-center space-x-4 w-full bg-[var(--bg-tertiary)] border border-[var(--glass-border)] p-1 px-6 rounded-2xl group focus-within:border-[#3b82f6]/50 transition-all relative h-16">
                <MessageSquare className="w-5 h-5 text-[#6b7280]" />
                 <input 
                   type="text" 
                   value={tacticalMessage}
                   onChange={(e) => setTacticalMessage(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendTactical()}
                   placeholder="Transmit tactical update..." 
                   className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-full font-bold placeholder:text-[#6b7280] tracking-tight"
                 />
              </div>
              <div className="relative">
                {isTransmitting && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#ef4444] text-white text-sm font-medium px-6 py-2.5 rounded-xl animate-bounce shadow-xl shadow-[#ef4444]/20 whitespace-nowrap z-[120] border border-white/20">
                    {tacticalMessage || 'LISTENING...'}
                  </div>
                )}
                <button 
                   onClick={toggleVoiceCapture}
                   className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group relative ${isTransmitting ? 'bg-[#ef4444] scale-110 shadow-[#ef4444]/40 animate-pulse' : 'bg-[#3b82f6] shadow-[#3b82f6]/30 hover:scale-110 active:scale-95'}`}
                >
                   <Mic className={`w-8 h-8 text-white relative z-10`} />
                   {isTransmitting && <div className="absolute inset-0 rounded-full bg-[#ef4444] animate-ping opacity-20"></div>}
                </button>
              </div>
         </div>

         <div className="flex items-center space-x-5">
            <div className="text-right">
               <span className="text-xs font-medium text-[#6b7280] ">Active Commander</span>
               <p className="text-xs font-medium text-[var(--text-primary)] tracking-tight">Shepard. J</p>
            </div>
            <div className="w-12 h-12 bg-[#3b82f6] rounded-[1.25rem] flex items-center justify-center font-medium text-sm text-white border-2 border-[var(--glass-border)] shadow-xl">
               JS
            </div>
         </div>
      </div>

      {/* 5. ASSIGN TASK MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-md" onClick={() => setIsAssignModalOpen(false)}></div>
           <div className="relative w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-12 space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                       <h2 className="text-3xl font-medium text-[var(--text-primary)] tracking-tight">Deploy Objective</h2>
                       <p className="text-sm text-[#6b7280] font-medium  mt-2">Resource Allocation Matrix</p>
                    </div>
                    <button onClick={() => setIsAssignModalOpen(false)} className="p-4 bg-[var(--bg-secondary)] hover:bg-[#ef4444]/10 rounded-2xl border border-[var(--glass-border)] text-[#6b7280] hover:text-[#ef4444] transition-all group">
                       <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                 </div>
 
                 <div className="space-y-4">
                    <label className="text-sm font-medium text-[#6b7280]  ml-2">Objective Description</label>
                    <textarea 
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Describe the tactical objective..."
                      className="w-full h-40 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-2xl p-8 text-sm text-[var(--text-primary)] placeholder:text-[#6b7280] focus:border-[#3b82f6]/50 outline-none transition-all resize-none font-bold tracking-tight"
                    />
                 </div>
 
                 <div className="space-y-4">
                    <label className="text-sm font-medium text-[#6b7280]  ml-2">Select Unit</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                       {cc.staff.map((member: StaffMember) => (
                         <button 
                           key={member.id}
                           onClick={() => setSelectedStaffId(member.id)}
                           className={`p-5 rounded-2xl border text-left transition-all flex items-center space-x-4 transform active:scale-95 group ${selectedStaffId === member.id ? 'bg-[#3b82f6] border-[#3b82f6] shadow-lg shadow-[#3b82f6]/20' : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[#3b82f6]/40'}`}
                         >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-medium text-xs ${selectedStaffId === member.id ? 'bg-white/20' : 'bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)]'}`}>
                               {member.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                               <p className={`text-xs font-medium tracking-tight ${selectedStaffId === member.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>{member.name}</p>
                               <p className={`text-sm font-medium  opacity-60 mt-1 ${selectedStaffId === member.id ? 'text-white' : 'text-[#6b7280]'}`}>
                                 {member.role}
                               </p>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
 
                 <button 
                   onClick={handleAssignTask}
                   className="w-full py-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-2xl text-xs font-medium  transition-all shadow-xl shadow-[#3b82f6]/20 transform active:scale-95"
                 >
                    Confirm Deployment
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FULL SCREEN CAMERA VIEW MODAL */}
      {selectedCamera && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 p-10">
           <div className="relative w-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden bg-[var(--bg-secondary)] border border-white/10 ">
              {/* Large Feed Image */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200')] bg-cover opacity-60 contrast-125 saturate-0"></div>
              
              {/* HUD Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-black/80"></div>
              
              {/* Corner Accents (Large) */}
              <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/20"></div>
              <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/20"></div>
              <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/20"></div>
              <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/20"></div>

              {/* Top Control Bar */}
              <div className="absolute top-8 left-10 right-10 flex justify-between items-center">
                 <div className="flex flex-col">
                    <div className="flex items-center space-x-4 mb-2">
                       <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse "></div>
                       <h2 className="text-3xl font-medium text-white ">{selectedCamera.id}</h2>
                    </div>
                    <span className="text-xs font-mono text-blue-400 ">{selectedCamera.loc} // SECTOR-7B</span>
                 </div>
                 
                 <div className="flex items-center space-x-6">
                    <div className="text-right">
                       <p className="text-sm font-mono text-white/40">System Status</p>
                       <p className="text-sm font-medium text-emerald-500 ">FEED NOMINAL</p>
                    </div>
                    <button 
                       onClick={() => setSelectedCamera(null)}
                       className="p-4 bg-white/10 hover:bg-rose-500/20 rounded-full border border-white/10 text-white transition-all group"
                    >
                       <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                 </div>
              </div>

              {/* Bottom HUD Analytics */}
              <div className="absolute bottom-10 left-10 right-10 grid grid-cols-4 gap-8">
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-sm font-mono text-white/40 mb-2">Biometric Flow</p>
                    <p className="text-2xl font-medium text-white">LOW DENSITY</p>
                 </div>
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-sm font-mono text-white/40 mb-2">Smoke Concentration</p>
                    <p className="text-2xl font-medium text-blue-400">0.02%</p>
                 </div>
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-sm font-mono text-white/40 mb-2">GPS COORDINATES</p>
                    <p className="text-xs font-mono text-white/60">34.0522 N, 118.2437 W</p>
                 </div>
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-sm font-mono text-white/40 mb-2">THERMAL SIGNATURE</p>
                    <p className="text-2xl font-medium text-rose-500">22.4°C</p>
                 </div>
              </div>

              {/* Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                 <div className="w-full h-1 bg-blue-400/20 absolute animate-[scan_5s_linear_infinite]"></div>
                 <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
