import React, { useState } from 'react';
import { 
  Shield, ShieldAlert, Navigation, Compass, Map, 
  Users, Activity, Zap, Flame, Wind, Lock, Unlock,
  MessageSquare, Mic, AlertTriangle, CheckCircle2,
  Clock, Heart, Thermometer, Box, Eye, Camera,
  CornerUpRight, ArrowUpRight, ArrowUp, CornerUpLeft,
  Smartphone, WifiOff, ListChecks, TrendingUp, AlertOctagon, Terminal, ClipboardList, MapPin, X, Maximize2, LogOut, Radio, LifeBuoy,
  Layers, Cpu, Database, Scan
} from 'lucide-react';
import { EmergencyResponse, ResponderData } from '../types';
import EvacuationMap from './EvacuationMap';
import ThemeToggle from './ThemeToggle';
import DigitalTwin from './DigitalTwin';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../hooks/useTheme';

interface ResponderDashboardProps {
  response: EmergencyResponse;
  onLogout: () => void;
}

const ResponderDashboard: React.FC<ResponderDashboardProps> = ({ response, onLogout }) => {
  const [focusMode, setFocusMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [tacticalMessage, setTacticalMessage] = useState('');
  const [activeCam, setActiveCam] = useState<'atrium' | 'lobby' | 'exit_b'>('atrium');
  const [controlMode, setControlMode] = useState<'manual' | 'assisted' | 'autonomous'>('manual');
  const transcriptRef = React.useRef('');
  const recognitionRef = React.useRef<any>(null);
  const { addToast } = useToast();
  const { theme } = useTheme();

  const rd = response.responder_data;
  if (!rd) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#1a73e8] font-medium  text-sm">Connecting to Tactical Hub...</p>
      </div>
    </div>
  );

  const toggleStep = (step: string) => {
    const next = new Set(completedSteps);
    if (next.has(step)) next.delete(step);
    else next.add(step);
    setCompletedSteps(next);
  };

  const handleQuickReport = (label: string) => {
    addToast(`REPORT SENT: ${label}`, 'success');
  };

  const handleAction = (action: string) => {
    addToast(`ACTION: ${action}`, action.includes('SOS') ? 'alert' : 'info');
  };

  const handleSendTactical = (msg?: string) => {
    const finalMsg = msg || tacticalMessage;
    if (!finalMsg.trim()) return;
    addToast(`TACTICAL UPDATE: ${finalMsg}`, 'info');
    setTacticalMessage('');
  };

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
        handleQuickReport(`VOICE CMD: ${transcriptRef.current}`);
        transcriptRef.current = '';
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setIsTransmitting(false);
      addToast(`Comm Uplink Error: ${e.error}. Check mic permissions.`, "alert");
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-all duration-500 overflow-x-hidden relative`}>
      <div className="fixed inset-0 bg-transparent pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      
      {/* 1. REFINED TACTICAL HEADER */}
      <header className="sticky top-0 z-[2000] bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--glass-border)] px-10 py-5 shadow-2xl">
         <div className="max-w-full mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6 flex-1">
               <div className="p-3.5 bg-[#1a73e8] rounded-2xl ">
                  <Shield className="w-6 h-6 text-white" />
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-none">Responder Terminal</h1>
                    <span className="px-3 py-1 bg-[#fce8e6] text-[#d93025] text-[14px] font-black rounded-lg border border-[#fce8e6] uppercase tracking-wider">Priority Alpha</span>
                  </div>
                  <div className="flex items-center space-x-8">
                     <span className="text-lg font-semibold text-[#1a73e8] tracking-tight">{rd.next_best_action.task}</span>
                     <div className="flex items-center space-x-3 text-[var(--text-secondary)]">
                        <MapPin className="w-5 h-5 text-[#1a73e8]" />
                        <span className="text-base font-bold tracking-tight">{rd.next_best_action.target} // {rd.next_best_action.distance}</span>
                     </div>
                  </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
               {/* CONTROL MODES */}
               <div className="flex items-center bg-[#f1f3f4] dark:bg-[var(--bg-tertiary)] p-1 rounded-lg border border-[var(--glass-border)] mr-4 shadow-none">
                  {(['manual', 'assisted', 'autonomous'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setControlMode(mode)}
                      className={`px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${controlMode === mode ? 'bg-[#1a73e8] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      {mode}
                    </button>
                  ))}
               </div>

               <ThemeToggle />
               <button onClick={() => setFocusMode(!focusMode)} className="p-3.5 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-all">
                  {focusMode ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
               </button>
               <button onClick={onLogout} className="p-3.5 bg-[#fce8e6] border border-[#fce8e6] rounded-xl hover:bg-[#fad2cf] transition-all group">
                  <LogOut className="w-5 h-5 text-[#d93025] group-hover:scale-110 transition-transform" />
               </button>
            </div>
         </div>
      </header>

      {/* 2. MAIN GRID */}
      <main className="px-10 pt-10 pb-32 max-w-full mx-auto">
        <div className="grid grid-cols-12 gap-10">
          
          {/* MAP AREA */}
          <div className={`${focusMode ? 'col-span-12' : 'col-span-12 xl:col-span-7'} h-[650px] transition-all duration-700 relative group/map`}>
             <div className="h-full bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--glass-border)] shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 z-10 pointer-events-none bg-[var(--bg-secondary)]/30 backdrop-blur-[0.5px]"></div>
                <DigitalTwin data={response} key="tactical-map" />
             </div>
          </div>

          {/* SIDE HUD */}
          {!focusMode && (
            <div className="col-span-12 xl:col-span-5 flex flex-col gap-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-4 custom-scrollbar">
               
               {/* CAMERA FEED (COMPACT) */}
               <div className="card !p-0 overflow-hidden relative group bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-2xl shrink-0">
                  <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-[var(--bg-primary)]/80 backdrop-blur-md rounded-md border border-[var(--glass-border)] flex items-center space-x-1.5">
                      <div className="w-1 h-1 bg-[#d93025] rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-[var(--text-primary)] tracking-widest">Live: {activeCam.toUpperCase()}</span>
                  </div>
                  <div className="relative overflow-hidden aspect-video">
                     <img 
                       src={activeCam === 'atrium' ? '/cam_atrium.png' : activeCam === 'lobby' ? '/cam_lobby.png' : '/cam_exit_b.png'} 
                       alt="Tactical Feed" 
                       className="w-full h-full object-cover filter contrast-[1.1] brightness-[0.9]"
                     />
                     <div className="absolute bottom-3 right-3 flex space-x-1">
                        {(['atrium', 'lobby', 'exit_b'] as const).map((cam) => (
                           <button key={cam} onClick={() => setActiveCam(cam)} className={`w-2 h-2 rounded-full transition-all ${activeCam === cam ? 'bg-[#1a73e8] w-4' : 'bg-white/50'}`}></button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* LIVE NAVIGATION */}
               <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-2xl overflow-hidden shrink-0">
                  <div className="p-3 bg-[#1a73e8]/5 border-b border-[var(--glass-border)] flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <Navigation className="w-4 h-4 text-[#1a73e8]" />
                        <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Live Route Guidance</span>
                     </div>
                     <span className="text-[11px] font-black text-[#1a73e8] uppercase">Alpha Path</span>
                  </div>
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-[#f1f3f4] rounded-lg flex items-center justify-center">
                              <ArrowUpRight className="w-5 h-5 text-[#1a73e8]" />
                           </div>
                           <div>
                              <p className="text-[14px] font-bold text-[var(--text-primary)]">Turn Right @ Stairwell B</p>
                              <p className="text-[12px] font-medium text-[var(--text-secondary)]">Proceed to Level 2</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[14px] font-bold text-[#1a73e8]">45m</p>
                           <p className="text-[12px] font-medium text-[var(--text-secondary)]">ETA 1m</p>
                        </div>
                     </div>
                     <div className="relative h-1.5 bg-[#f1f3f4] rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-[#1a73e8] w-2/3 transition-all duration-1000"></div>
                     </div>
                  </div>
               </div>

               {/* TEAM COORDINATION */}
               <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-sm rounded-2xl overflow-hidden shrink-0">
                  <div className="p-3 bg-[#f1f3f4] dark:bg-[var(--bg-tertiary)] border-b border-[var(--glass-border)] flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#5f6368]" />
                        <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Team Coordination</span>
                     </div>
                     <span className="text-[11px] font-black text-[#34a853] uppercase">4 Online</span>
                  </div>
                  <div className="p-4 space-y-4">
                     {[
                        { name: 'Sgt. Miller', status: 'Active', zone: 'Zone B', color: 'bg-[#1a73e8]' },
                        { name: 'Dr. Chen', status: 'Medical', zone: 'Zone A', color: 'bg-[#34a853]' },
                        { name: 'Lt. Rodriguez', status: 'Search', zone: 'Zone C', color: 'bg-[#fbbc05]' }
                     ].map((member, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${member.color} text-white rounded-full flex items-center justify-center text-[11px] font-bold`}>{member.name.charAt(5)}</div>
                              <div>
                                 <p className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{member.name}</p>
                                 <p className="text-[11px] font-medium text-[var(--text-secondary)]">{member.zone}</p>
                              </div>
                           </div>
                           <span className="text-[11px] font-bold px-2 py-1 bg-[#f1f3f4] rounded text-[var(--text-secondary)]">{member.status}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* QUICK ACTION PANEL */}
               <div className="card bg-[#f1f3f4] dark:bg-[var(--bg-tertiary)] border-[var(--glass-border)] shadow-sm rounded-2xl p-5 shrink-0">
                  <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Tactical Override</p>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                        { label: 'Ventilation', icon: Wind, color: 'text-[#1a73e8]' },
                        { label: 'Backup', icon: Radio, color: 'text-[#d93025]' },
                        { label: 'Broadcast', icon: MessageSquare, color: 'text-[#fbbc05]' },
                        { label: 'Reroute', icon: CornerUpRight, color: 'text-[#34a853]' }
                     ].map((action, i) => (
                        <button 
                           key={i} 
                           onClick={() => handleQuickReport(`OVERRIDE: ${action.label}`)}
                           className="flex items-center space-x-3 p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--glass-border)] hover:border-[#1a73e8] transition-all group"
                        >
                           <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                           <span className="text-[13px] font-bold text-[var(--text-primary)]">{action.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* VITALS (GOOGLE STYLE) */}
               <div className="grid grid-cols-2 gap-6 shrink-0">
                  {[
                    { label: 'Heart Rate', val: rd.biometrics.heart_rate, unit: 'BPM', icon: Activity, color: 'text-[#d93025]', bg: 'bg-rose-50' },
                    { label: 'Oxygen', val: rd.biometrics.oxygen_level, unit: '%', icon: Wind, color: 'text-[#1a73e8]', bg: 'bg-blue-50' }
                  ].map((bio, i) => (
                    <div key={i} className={`card !p-6 flex flex-col items-center justify-center bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-md rounded-[2rem] hover:shadow-lg transition-shadow`}>
                       <p className="text-[12px] font-black text-[#5f6368] uppercase tracking-[0.2em] mb-4">{bio.label}</p>
                       <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">{bio.val}</span>
                          <span className="text-sm font-bold text-[#5f6368]">{bio.unit}</span>
                       </div>
                    </div>
                  ))}
               </div>

               {/* SOP CHECKLIST (GOOGLE STYLE) */}
               <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-md rounded-[2.5rem] p-8 shrink-0">
                  <div className="flex items-center space-x-4 mb-8">
                     <div className="p-3 bg-[#1a73e8] rounded-2xl shadow-lg shadow-[#1a73e8]/20">
                        <ListChecks className="w-6 h-6 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Tactical SOPs</h3>
                  </div>
                  <div className="space-y-4">
                     {rd.micro_sop.map((step: string, i: number) => (
                       <button 
                         key={i} 
                         onClick={() => toggleStep(step)}
                         className={`w-full flex items-center space-x-6 p-6 rounded-2xl border transition-all text-left group ${completedSteps.has(step) ? 'bg-[#34a853]/10 border-[#34a853]/30 text-[#137333]' : 'bg-[var(--bg-primary)] border-[var(--glass-border)] text-[var(--text-primary)] hover:border-[#1a73e8] hover:shadow-md'}`}
                       >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${completedSteps.has(step) ? 'bg-[#34a853] border-[#34a853] ' : 'bg-[var(--bg-primary)] border-[var(--glass-border)] group-hover:border-[#1a73e8]'}`}>
                             {completedSteps.has(step) && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </div>
                          <span className="text-lg font-bold tracking-tight">{step}</span>
                       </button>
                     ))}
                  </div>
               </div>

               {/* HAZARD MATRIX (GOOGLE STYLE) */}
               <div className="card bg-[var(--bg-secondary)] border-[var(--glass-border)] shadow-md rounded-[2.5rem] p-8 shrink-0">
                  <div className="flex items-center space-x-4 mb-8">
                     <div className="p-3 bg-[#d93025] rounded-2xl shadow-lg shadow-[#d93025]/20">
                        <AlertTriangle className="w-6 h-6 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Hazard Matrix</h3>
                  </div>
                  <div className="space-y-4">
                     {rd.hazard_predictions.map((p: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-[var(--bg-primary)] rounded-2xl border border-[var(--glass-border)] shadow-sm">
                          <div>
                             <p className="text-lg font-black text-[#d93025] mb-1 uppercase tracking-tight">{p.type}</p>
                             <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">{p.action}</p>
                          </div>
                          <span className="text-lg font-black px-5 py-2.5 bg-[#d93025] text-white rounded-xl shadow-md">{p.timer}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. ACTION BAR (GOOGLE STYLE) */}
      <footer className="fixed bottom-0 left-0 right-0 z-[2000] bg-[var(--bg-primary)]/95 backdrop-blur-xl border-t border-[var(--glass-border)] px-10 py-6 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
         <div className="max-w-full mx-auto flex items-center justify-between gap-12">
            
            {/* STATUS BUTTONS (THEME AWARE) */}
            <div className="flex items-center space-x-6">
                {[
                  { label: 'Area Clear', icon: CheckCircle2, color: 'var(--success-text)', bg: 'var(--success-bg)' },
                  { label: 'Blocked', icon: AlertTriangle, color: 'var(--critical-text)', bg: 'var(--critical-bg)' },
                  { label: 'Found Victim', icon: Users, color: 'var(--info-text)', bg: 'var(--info-bg)' },
                  { label: 'Containment', icon: Flame, color: 'var(--warning-text)', bg: 'var(--warning-bg)' }
                ].map(btn => (
                  <button 
                    key={btn.label} 
                    onClick={() => handleQuickReport(btn.label)}
                    className="flex items-center space-x-4 px-8 py-4 rounded-2xl hover:brightness-125 transition-all group shadow-md"
                    style={{ backgroundColor: btn.bg.replace('0.15', '0.25') || btn.bg }}
                  >
                     <btn.icon className="w-6 h-6 transition-transform group-hover:scale-110" style={{ color: btn.color }} />
                     <span className="text-base font-bold" style={{ color: btn.color }}>{btn.label}</span>
                  </button>
                ))}
            </div>

            {/* MASTER SOS */}
            <button 
              onClick={() => { setSosActive(!sosActive); handleAction(sosActive ? 'SOS CANCELLED' : 'SOS ACTIVATED'); }}
              className={`max-w-[400px] flex-1 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 relative overflow-hidden group shadow-xl ${sosActive ? 'bg-[#d93025] animate-pulse' : 'bg-[#d93025] hover:bg-[#b9261c] shadow-[#d93025]/20'}`}
            >
               <div className="flex items-center space-x-5 relative z-10">
                  <ShieldAlert className="w-8 h-8 text-white" />
                  <div className="text-left text-white">
                     <p className="text-xl font-black leading-none tracking-tight uppercase">{sosActive ? 'SOS ACTIVE' : 'RESPONDER SOS'}</p>
                     <p className="text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">Emergency Command Uplink</p>
                  </div>
               </div>
            </button>

            {/* COMMS */}
            <div className="relative group">
              <button 
                onClick={toggleVoiceCapture}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 relative ${isTransmitting ? 'bg-[#d93025] scale-110' : 'bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95'}`}
              >
                 <Mic className="w-7 h-7 text-white relative z-10" />
                 {isTransmitting && <div className="absolute inset-0 rounded-2xl bg-[#d93025] animate-ping opacity-20"></div>}
              </button>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default ResponderDashboard;
