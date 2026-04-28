import React, { useState } from 'react';
import { ClipboardList, CheckSquare, Square, History, AlertCircle } from 'lucide-react';
import { SOPData, SOPStep } from '../types';
import { useToast } from '../context/ToastContext';

interface InteractiveSOPProps {
  sop: SOPData;
}

const InteractiveSOP: React.FC<InteractiveSOPProps> = ({ sop }) => {
  const [steps, setSteps] = useState<SOPStep[]>(sop.steps || []);
  const { addToast } = useToast();

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative glass-morphism rounded-[2rem] p-8 hover-lift border-teal-500/30">
        <div className="flex items-center justify-between pb-5 border-b border-white/10 dark:border-white/5 light:border-black/5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-emerald-500/30 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-xl border border-teal-400/30 hover-lift">
                <ClipboardList className="w-6 h-6 text-teal-400" />
                <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full glow-green"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Interactive SOPs</h2>
              <p className="text-xs text-teal-400/70 font-mono tracking-widest uppercase">Versioned Protocols {sop.version}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold uppercase mb-1">
                <History className="w-3 h-3" />
                <span>Last Updated: {sop.last_updated}</span>
             </div>
             <div className="h-1 w-24 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {steps.map((step) => (
            <div 
              key={step.id} 
              onClick={() => toggleStep(step.id)}
              className={`group/step cursor-pointer relative flex items-center pr-36 p-6 rounded-2xl border transition-all duration-500 ${
                step.completed 
                  ? 'bg-teal-500/10 border-teal-500/30' 
                  : 'bg-white/[0.03] dark:bg-white/5 light:bg-slate-100 border-white/5 hover:border-teal-500/20 shadow-sm'
              }`}
            >
              <div className="mr-4 transition-transform group-hover/step:scale-110">
                {step.completed ? (
                  <CheckSquare className="w-6 h-6 text-teal-400" />
                ) : (
                  <Square className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold transition-all ${step.completed ? 'text-teal-400 line-through opacity-60' : 'text-slate-800 dark:text-slate-200 light:text-slate-900 font-black'}`}>
                    {step.task}
                  </span>
                  {step.mandatory && !step.completed && (
                    <span className="text-[8px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-tighter">REQUIRED</span>
                  )}
                </div>
              </div>
              {step.completed && (
                <div className="absolute right-4 text-[10px] font-mono text-teal-400/50 italic animate-in fade-in slide-in-from-right duration-500">
                  Logged to Blockchain
                </div>
              )}
            </div>
          ))}
        </div>

          <div className="mt-8 p-5 bg-teal-900/10 dark:bg-teal-900/20 light:bg-teal-50/50 border border-teal-500/20 rounded-2xl flex items-start space-x-3">
             <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
             <p className="text-xs text-slate-600 dark:text-teal-100/70 font-medium leading-relaxed">
               Protocols are legally binding. Failure to complete mandatory steps will be flagged in the post-incident audit.
             </p>
          </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
           <button 
             disabled={progress < 100}
             onClick={() => addToast('SOP Finalized and Synced to Global Command!', 'success')}
             className={`px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
               progress === 100 
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:scale-[1.02]' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
             }`}
           >
             Finalize Protocol Execution
           </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSOP;
