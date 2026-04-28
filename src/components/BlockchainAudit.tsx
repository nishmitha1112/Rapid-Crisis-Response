import React from 'react';
import { Database, Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import { BlockchainEntry } from '../types';

interface BlockchainAuditProps {
  logs: BlockchainEntry[];
}

const BlockchainAudit: React.FC<BlockchainAuditProps> = ({ logs }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative glass-morphism rounded-[2rem] p-8 hover-lift border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-400/30 hover-lift">
                <Database className="w-6 h-6 text-emerald-400" />
                <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full glow-green"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Blockchain Black Box</h2>
              <p className="text-xs text-emerald-400/70 font-mono tracking-widest uppercase">Immutable Audit Trail</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Verified Integrity</span>
          </div>
        </div>

        <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {(logs || []).map((log, index) => (
            <div key={log.hash} className="relative group/item">
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-emerald-500/10 group-last/item:hidden"></div>
              <div className="flex space-x-4">
                <div className="relative z-10">
                  <div className={`p-2 rounded-full ${index === 0 ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-100 dark:bg-slate-700/50'} border border-emerald-500/30`}>
                    <Lock className={`w-3 h-3 ${index === 0 ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-400 light:text-slate-500'}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[10px] font-mono text-emerald-500/50">HASH: {log.hash.slice(0, 8)}...</span>
                  </div>
                  <div className="bg-white/[0.03] dark:bg-black/20 light:bg-slate-50 rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-sm font-bold text-emerald-400">{log.event_type}</h4>
                       <CheckCircle className="w-3 h-3 text-emerald-500/50" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 light:text-slate-700 leading-relaxed font-medium">
                      {log.details}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] text-slate-500 font-mono">PREV: {log.prev_hash.slice(0, 8)}...</span>
                       <div className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full pulse-glow"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-mono">Node Sync Active</span>
          </div>
          <p className="font-medium italic">Tamper-Proof Encryption Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAudit;
