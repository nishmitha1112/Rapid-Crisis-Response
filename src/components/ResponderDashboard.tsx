import React, { useState } from 'react';
import { 
  Shield, ShieldAlert, Navigation, Compass, Map, 
  Users, Activity, Zap, Flame, Wind, Lock, Unlock,
  MessageSquare, Mic, AlertTriangle, CheckCircle2,
  Clock, Heart, Thermometer, Box, Eye, Camera,
  CornerUpRight, ArrowUpRight, ArrowUp, CornerUpLeft,
  Smartphone, WifiOff, ListChecks, TrendingUp, AlertOctagon, Terminal, ClipboardList, MapPin, X, Maximize2, LogOut, Radio, LifeBuoy,
  Layers, Cpu, Database, Scan, Search, Layout, Wifi
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
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-24 flex flex-col items-center py-8 bg-[#0f1117] border-r border-white/5 shadow-2xl z-50">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-12 shadow-lg shadow-blue-500/20 group cursor-pointer hover:scale-105 transition-all">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <nav className="flex flex-col gap-8 flex-1">
          {[
            { icon: Layout, label: 'Dashboard', active: true },
            { icon: AlertOctagon, label: 'Incidents' },
            { icon: Database, label: 'Resources' },
            { icon: Map, label: 'Layers' },
            { icon: TrendingUp, label: 'Analytics' }
          ].map((item, i) => (
            <button key={i} className={`p-3.5 rounded-xl transition-all group relative ${item.active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <item.icon className="w-6 h-6" />
              {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="p-3.5 text-slate-500 hover:text-red-400 transition-all">
          <LogOut className="w-6 h-6" />
        </button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-10 bg-[#0b0e14]/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-12">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-blue-500"><Search className="w-6 h-6" /></span> ResQAI
            </h1>
            <div className="text-3xl font-light text-slate-400 tabular-nums">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-slate-900/50 p-1 rounded-xl border border-white/5">
               {[
                 { label: 'System Connectivity', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                 { label: 'Active Incidents', icon: AlertTriangle, val: '0', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                 { label: 'Team Availability', icon: Users, val: '0', color: 'text-blue-400', bg: 'bg-blue-500/10' }
               ].map((stat, i) => (
                 <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${stat.bg} border border-white/5`}>
                   <stat.icon className={`w-4 h-4 ${stat.color}`} />
                   <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stat.label}</span>
                   {stat.val && <span className="ml-1 text-xs font-black text-white">{stat.val}</span>}
                 </div>
               ))}
            </div>
            <ThemeToggle />
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-slate-400">RE</div>
          </div>
        </header>

        {/* SCROLLABLE GRID */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-40">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Dashboard</h2>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all">
                  <Layers className="w-4 h-4" /> Filters
                </button>
              </div>
            </div>

            {/* TOP ROW: MAP + SIDEBARS */}
            <div className="grid grid-cols-12 gap-8 h-[600px]">
              {/* CENTRAL MAP */}
              <div className="col-span-8 bg-[#0f1117] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
                <DigitalTwin data={response} key="tactical-map" />
                {/* MAP OVERLAYS */}
                <div className="absolute top-6 left-6 z-10 w-72 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><Search className="w-5 h-5 text-blue-400" /></div>
                  <input type="text" placeholder="Scanning Tactical Vectors..." className="bg-transparent border-none outline-none text-sm font-medium text-white placeholder-slate-500 w-full" />
                  <button className="text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest border border-white/10 px-2 py-1 rounded">Matrix</button>
                  <Mic className="w-4 h-4 text-slate-500 cursor-pointer" />
                </div>
              </div>

              {/* RIGHT SIDEBARS */}
              <div className="col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* CHARTS */}
                <div className="bg-[#0f1117] rounded-3xl border border-white/5 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Analytics</h3>
                    <button className="text-slate-600 hover:text-slate-400"><TrendingUp className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-white tracking-tighter">139</span>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active</span>
                       <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Incidents: 2</span>
                    </div>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[40, 60, 30, 80, 45, 90, 55, 30, 70, 50, 85, 40].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-500/40 transition-all cursor-pointer group relative" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-black text-[8px] font-black px-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">{h}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INCIDENT FEED */}
                <div className="bg-[#0f1117] rounded-3xl border border-white/5 p-6 flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Incident Feeds</h3>
                    <button className="text-slate-600 hover:text-slate-400"><Database className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-6">
                    {[
                      { id: 1, title: 'Medical Alert', time: '1m ago', desc: 'Sgt. Miller reporting cardiac distress.', color: 'text-blue-400', dot: 'bg-blue-500' },
                      { id: 2, title: 'Structural Risk', time: '10m ago', desc: 'Structural integrity compromised in Sector B.', color: 'text-rose-400', dot: 'bg-rose-500' }
                    ].map((incident) => (
                      <div key={incident.id} className="relative pl-6 border-l border-white/5">
                        <div className={`absolute left-[-4.5px] top-1 w-2 h-2 rounded-full ${incident.dot} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-white">{incident.title}</h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{incident.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{incident.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: STAT CARDS */}
            <div className="grid grid-cols-4 gap-8">
              {[
                { title: 'Incidents', icon: AlertTriangle, val: '85507AI', sub: 'Critical Sector', color: 'text-rose-400' },
                { title: 'Resources', icon: Database, val: '57%', sub: 'Deployment Active', color: 'text-blue-400' },
                { title: 'Response Stats', icon: TrendingUp, val: '94%', sub: 'Efficiency Rating', color: 'text-emerald-400' },
                { title: 'Command Links', icon: Layout, val: '05', sub: 'Uplinks Active', color: 'text-blue-400' }
              ].map((card, i) => (
                <div key={i} className="bg-[#0f1117] rounded-3xl border border-white/5 p-6 hover:bg-white/5 transition-all cursor-pointer group shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.title}</h4>
                    <card.icon className={`w-5 h-5 ${card.color} opacity-40 group-hover:opacity-100 transition-all`} />
                  </div>
                  <div className="text-3xl font-black text-white tracking-tighter mb-1">{card.val}</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* 3. ULTRA ACTION BAR (GLOWING BUTTONS) */}
        <footer className="fixed bottom-0 left-24 right-0 h-32 flex items-center justify-center px-10 bg-[#0b0e14]/80 backdrop-blur-2xl border-t border-white/10 z-50">
          <div className="max-w-[1400px] w-full grid grid-cols-4 gap-8">
            {[
              { label: 'Area Clear', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', glow: 'shadow-emerald-500/20' },
              { label: 'Blocked', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/5', glow: 'shadow-rose-500/20' },
              { label: 'Found Victim', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', glow: 'shadow-blue-500/20' },
              { label: 'RESPONDER SOS', color: 'text-white', border: 'border-rose-600', bg: 'bg-rose-600', glow: 'shadow-rose-600/40', heavy: true }
            ].map((btn, i) => (
              <button 
                key={i} 
                onClick={() => handleAction(btn.label)}
                className={`h-20 rounded-[2rem] border-2 ${btn.border} ${btn.bg} flex items-center justify-center text-2xl font-black uppercase tracking-tighter shadow-2xl ${btn.glow} hover:scale-[1.02] active:scale-[0.98] transition-all group`}
              >
                <span className={`${btn.color} group-hover:scale-105 transition-transform`}>{btn.label}</span>
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ResponderDashboard;
