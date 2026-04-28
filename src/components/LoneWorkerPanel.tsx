import React, { useState, useEffect } from 'react';
import { User, Timer, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { ResilienceData } from '../types';

interface LoneWorkerPanelProps {
  alerts: string[];
  resilience: ResilienceData;
}

const LoneWorkerPanel: React.FC<LoneWorkerPanelProps> = ({ alerts, resilience }) => {
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins demo
  const [isSafe, setIsSafe] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSafe) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isSafe]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative glass-morphism rounded-[2rem] p-8 hover-lift border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10 dark:border-white/5 light:border-black/5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30 hover-lift">
                <User className="w-6 h-6 text-amber-400" />
                <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full glow-amber"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Lone Worker Support</h2>
              <p className="text-xs text-amber-400/70 font-mono tracking-widest uppercase">Safety Check-In System</p>
            </div>
          </div>
          {resilience.mode === 'AD_HOC_MESH' && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter shimmer">P2P MESH ACTIVE</span>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-8">
          <div className="bg-white/[0.03] dark:bg-slate-900/40 light:bg-slate-100 rounded-[2rem] p-8 border border-white/5 text-center relative overflow-hidden shadow-sm">
             {isSafe ? (
               <div className="relative z-10 space-y-2 animate-in fade-in zoom-in duration-500">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h3 className="text-xl font-black text-slate-800 dark:text-white light:text-slate-900">SAFETY CONFIRMED</h3>
                  <p className="text-emerald-400/70 text-sm font-medium">Checked in via resilience mesh</p>
               </div>
             ) : (
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Timer className={`w-8 h-8 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                    <span className={`text-5xl font-black font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-slate-800 dark:text-white light:text-slate-900'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 light:text-slate-600 text-sm font-medium">Next check-in required by concierge</p>
                  <button 
                    onClick={() => setIsSafe(true)}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    I AM SAFE - CHECK IN
                  </button>
               </div>
             )}
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16"></div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Critical Alerts</h4>
             {alerts.length > 0 ? (
               alerts.map((alert, i) => (
                 <div key={i} className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-100">{alert}</p>
                 </div>
               ))
             ) : (
               <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <p className="text-xs text-emerald-400/60 font-medium text-center">No overdue lone workers detected.</p>
               </div>
             )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500">
           <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                 <span className="font-medium">Weak Connectivity Mode: ON</span>
              </div>
              <div className="flex items-center space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                 <span className="font-medium">Ad-hoc Mesh: {resilience.peer_count} peers</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoneWorkerPanel;
