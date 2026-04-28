import React, { useState } from 'react';
import { Newspaper, FileText, CheckCircle2, AlertCircle, Edit3, Share2 } from 'lucide-react';
import { PRNarrative } from '../types';
import { useToast } from '../context/ToastContext';

interface PRLegalHubProps {
  narrative: PRNarrative;
}

const PRLegalHub: React.FC<PRLegalHubProps> = ({ narrative }) => {
  const [status, setStatus] = useState(narrative.approval_status);
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(narrative.body);

  const getStatusDisplay = (s: typeof status) => {
    switch (s) {
      case 'APPROVED': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'REJECTED': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <AlertCircle className="w-4 h-4" /> };
      default: return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <FileText className="w-4 h-4" /> };
    }
  };

  const currentStatus = getStatusDisplay(status);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative glass-morphism rounded-[2rem] p-8 hover-lift border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-400/30 hover-lift">
                <Newspaper className="w-6 h-6 text-indigo-400" />
                <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full glow-blue"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">PR & Legal Narrative</h2>
              <p className="text-xs text-indigo-400/70 font-mono tracking-widest uppercase">Auto-Generated Release Brief</p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 ${currentStatus.bg} rounded-full border ${currentStatus.border}`}>
            {currentStatus.icon}
            <span className={`text-[10px] font-bold ${currentStatus.color} uppercase tracking-tighter`}>{status.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 dark:text-white light:text-slate-900 shimmer leading-tight">{narrative.headline}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold uppercase">
                <FileText className="w-3 h-3" />
                <span>Format: Neutral Tone</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold uppercase">
                <Share2 className="w-3 h-3" />
                <span>Ready for Social/Media</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {isEditing ? (
              <textarea 
                className="w-full h-48 bg-slate-900/60 border border-indigo-500/30 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            ) : (
              <div className="bg-white/[0.03] dark:bg-white/5 light:bg-slate-100 rounded-2xl p-8 border border-white/5 relative group/body shadow-sm">
                <p className="text-sm text-slate-600 dark:text-slate-300 light:text-slate-800 leading-relaxed font-medium">
                  {body}
                </p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 p-2 bg-indigo-500/10 rounded-lg opacity-0 group-hover/body:opacity-100 transition-opacity hover:bg-indigo-500/20"
                >
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button 
              onClick={() => { setStatus('APPROVED'); setIsEditing(false); addToast('Narrative securely approved for release.', 'success'); }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 uppercase tracking-widest"
            >
              Approve Narrative
            </button>
            <button 
              onClick={() => { setStatus('REJECTED'); setIsEditing(false); addToast('Narrative rejected. Generating new draft...', 'alert'); }}
              className="w-full py-3 bg-white/[0.03] dark:bg-white/[0.03] light:bg-slate-200/50 hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-xl transition-all border border-white/10 uppercase tracking-widest"
            >
              Reject / Redraft
            </button>
          </div>

          <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/10">
             <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Narrative Logic Check</h4>
             <div className="space-y-2">
                {(narrative.timeline_summary || []).map((event, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <span>{event}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRLegalHub;
