import React from 'react';
import { AlertTriangle, Users, MapPin, Clock, Activity, Shield, Phone, Flame, Brain, Zap, Target, TrendingUp } from 'lucide-react';
import { EmergencyResponse } from '../types';
import BlockchainAudit from './BlockchainAudit';
import RawDataStream from './RawDataStream';
import LoneWorkerPanel from './LoneWorkerPanel';
import PRLegalHub from './PRLegalHub';
import InteractiveSOP from './InteractiveSOP';
import DigitalTwin from './DigitalTwin';

interface EmergencyDashboardProps {
  response: EmergencyResponse;
}

const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({ response }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'status-critical';
      case 'MODERATE': return 'status-moderate';
      case 'LOW': return 'status-low';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL': return <AlertTriangle className="w-6 h-6" />;
      case 'MODERATE': return <Activity className="w-6 h-6" />;
      case 'LOW': return <Shield className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Crisis Header - Slimmer for Vertical Fit */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-rose-500/10 rounded-[2rem] blur-2xl opacity-50"></div>
        <div className="relative glass-morphism rounded-[2rem] p-8 flex flex-col xl:flex-row items-center justify-between border-rose-500/10">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-rose-500/30 rounded-2xl blur-xl animate-pulse"></div>
              <div className="relative p-5 bg-white/[0.03] dark:bg-[#020617] light:bg-white rounded-2xl border border-rose-500/30">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1.5">
                <span className="px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-[9px] font-black text-rose-500 tracking-widest uppercase">Live Intelligence Active</span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white light:text-slate-900 tracking-tighter leading-none mb-2">
                {response.status} <span className="text-zinc-500 dark:text-gray-500 font-light text-xl">@ {response.log.input.location}</span>
              </h1>
              <div className="flex items-center space-x-4 text-xs">
                 <span className="text-rose-500 font-black tracking-widest uppercase font-mono">{response.priority_level}</span>
                 <div className="w-1 h-1 bg-slate-500/30 rounded-full"></div>
                 <span className="text-slate-500 font-bold font-mono">ID: {response.incident_id.slice(0, 12)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 xl:mt-0">
             <div className="px-6 py-2.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover-lift">
                Authorities Bridge: Active
             </div>
          </div>
        </div>
      </div>

      {/* Hex-Metrics Grid - Optimized Typography */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {[
          { label: 'CONFIDENCE', val: `${response.confidence}%`, icon: Activity, color: 'cyan' },
          { label: 'ROUTE', val: response.route, icon: MapPin, color: 'emerald' },
          { label: 'RESPONSE', val: response.response_time, icon: Clock, color: 'amber' },
          { label: 'TEAMS', val: response.resources.length, icon: Users, color: 'purple' },
          { label: 'STAGE', val: response.crisis_stage, icon: Target, color: 'rose' },
          { label: 'SLA', val: response.kpis.sla_met ? 'OPTIMAL' : 'RECOVERY', icon: Shield, color: 'blue' }
        ].map((m, i) => (
          <div key={i} className="relative glass-morphism rounded-[1.25rem] p-3 border-white/[0.02] hover-lift">
            <div className="flex items-center space-x-2 mb-1">
               <div className={`p-1.5 bg-${m.color}-500/10 rounded-lg border border-${m.color}-500/20`}>
                  <m.icon className={`w-3 h-3 text-${m.color}-400`} />
               </div>
               <span className="text-[7px] text-gray-500 font-black tracking-widest uppercase truncate">{m.label}</span>
            </div>
            <p className="text-xs font-black text-slate-800 dark:text-white truncate" title={String(m.val)}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* Primary Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Actions */}
           <div className="glass-morphism rounded-[2rem] p-8 hover-lift">
              <div className="flex items-center space-x-3 pb-5 border-b border-white/10">
                 <Flame className="w-5 h-5 text-orange-400" />
                 <h2 className="text-xl font-bold tracking-tight">Active Actions</h2>
              </div>
              <div className="mt-6 space-y-3">
                 {response.priority_tasks.slice(0, 4).map((t, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] font-medium text-gray-400">
                       <span className="w-6 h-6 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded-lg font-black text-[9px]">{i+1}</span>
                       <span className="truncate">{t}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Personnel */}
           <div className="glass-morphism rounded-[2rem] p-8 hover-lift">
              <div className="flex items-center space-x-3 pb-5 border-b border-white/10">
                 <Users className="w-5 h-5 text-blue-400" />
                 <h2 className="text-xl font-bold tracking-tight">Rescue Teams</h2>
              </div>
              <div className="mt-6 space-y-4">
                 {[
                   { label: 'Command', count: response.coordination.command.length, color: 'rose' },
                   { label: 'Support', count: response.coordination.support.length, color: 'amber' },
                   { label: 'Evacuation', count: response.coordination.evacuation.length, color: 'emerald' }
                 ].map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/5">
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{g.label}</span>
                       <span className={`text-xl font-black text-${g.color}-400`}>{g.count}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* AI Sidepanel */}
        <div className="glass-morphism rounded-[2rem] p-8 bg-purple-500/5 border-purple-500/10 lg:col-span-2 2xl:col-span-1">
           <div className="flex items-center space-x-3 pb-5 border-b border-purple-500/10">
              <Brain className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold tracking-tight">AI Insights</h2>
           </div>
           <div className="mt-6 space-y-5">
              <div>
                 <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1.5 block">Situation Awareness</span>
                 <p className="text-xs font-semibold text-gray-200 leading-relaxed font-mono">{response.situation}</p>
              </div>
              <div className="px-4 py-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                 <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-1">Anomaly Detection</span>
                 <p className="text-[10px] font-bold text-gray-400">{response.anomaly}</p>
              </div>
              <div className="pt-4 flex flex-wrap gap-1.5">
                 {(response.channels || []).map((chan, i) => (
                    <span key={i} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md text-[9px] font-black border border-cyan-500/20 uppercase tracking-tighter">{chan}</span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Main Stream Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <DigitalTwin data={response} incidentUnit={response.spatial_info.unit} />
         </div>
         <div className="xl:col-span-1">
            <RawDataStream data={response.raw_stream} />
         </div>
      </div>

      {/* Protocol Execution Layer */}
      <div className="w-full mb-8">
         <InteractiveSOP sop={response.active_sop} />
      </div>

      {/* Global Audit Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
         <div className="w-full">
           <BlockchainAudit logs={response.blockchain_log} />
         </div>
         <div className="w-full">
           <PRLegalHub narrative={response.pr_narrative} />
         </div>
         <div className="w-full lg:col-span-2 2xl:col-span-1">
           <LoneWorkerPanel alerts={response.lone_worker_alerts} resilience={response.resilience} />
         </div>
      </div>

      {/* Footer Metrics Row - Merged for Single-Page Fit */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 glass-morphism rounded-[2rem] p-8">
            <div className="flex items-center space-x-3 pb-5 border-b border-white/10">
               <Clock className="w-5 h-5 text-indigo-400" />
               <h2 className="text-xl font-bold tracking-tight">Timeline Brief</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 mt-6">
               {(response.timeline || []).map((e, i) => (
                  <div key={i} className="flex items-center space-x-3 text-[10px] border-b border-white/5 pb-2">
                     <span className="font-mono text-indigo-400/50">{String(i+1).padStart(2,'0')}</span>
                     <span className="text-gray-400 truncate">{e}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-morphism rounded-[2.25rem] p-8 flex-1 flex flex-col justify-between">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Decision Latency</span>
               <div>
                  <span className="text-5xl font-black text-slate-800 dark:text-white shimmer leading-none">{response.kpis.time_to_decision_sec}s</span>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mt-2 tracking-tighter">✓ SLA COMPLIANT</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default EmergencyDashboard;
