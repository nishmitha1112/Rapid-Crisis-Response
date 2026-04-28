import React, { useState, useEffect } from 'react';
import { Globe, ShieldAlert, Zap, TrendingUp, AlertTriangle, X, Loader2, Search } from 'lucide-react';
import { emergencyApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface GlobalIncident {
  id: string;
  location: string;
  type: string;
  status: string;
  severity: string;
  impact: string;
  eta: string;
}

interface GlobalData {
  summary: {
    total_incidents: number;
    critical_hubs: number;
    active_responders: number;
    global_status: string;
  };
  incidents: GlobalIncident[];
}

const GlobalIntelligenceMatrix: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await emergencyApi.getGlobalIntelligence();
      setData(result);
      addToast('Satellite Data Synchronized', 'success');
    } catch (error) {
      console.error('Failed to fetch global intelligence:', error);
      addToast('Data Sync Failed', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredIncidents = data?.incidents.filter(inc => 
    inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 md:p-12">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[90vh] bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--glass-border)] shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* TACTICAL HEADER */}
        <div className="p-8 border-b border-[var(--glass-border)] flex items-center justify-between bg-[var(--bg-secondary)] text-[var(--text-primary)]">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 bg-[#1a73e8]/10 rounded-2xl border border-[#1a73e8]/30 flex items-center justify-center">
              <Globe className="w-8 h-8 text-[#1a73e8] animate-[spin_20s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Global Intelligence Matrix</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-[#1a73e8] text-[10px] font-bold uppercase tracking-widest">Satellite Link: Alpha-7</span>
                <div className="w-1 h-1 bg-[var(--text-secondary)]/20 rounded-full"></div>
                <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">ResQAI Global Hub</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="hidden lg:flex items-center space-x-10">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Global Risk</p>
                  <p className="text-base font-bold text-[#d93025] uppercase tracking-tight">{data?.summary.global_status || 'SCANNING...'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Active Hubs</p>
                  <p className="text-base font-bold text-[var(--text-primary)] tracking-tight">{data?.summary.total_incidents || 0}</p>
               </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl transition-all shadow-sm">
              <X className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
          </div>
        </div>
 
        {/* SEARCH & FILTERS HUB */}
        <div className="px-8 py-6 bg-[var(--bg-secondary)]/50 border-b border-[var(--glass-border)] flex items-center space-x-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]/40 group-focus-within:text-[#1a73e8] transition-colors" />
            <input 
              type="text" 
              placeholder="Query Global Tactical Vectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl outline-none focus:border-[#1a73e8] transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 shadow-sm"
            />
          </div>
          <button 
            onClick={fetchData}
            className="px-8 py-4 bg-[#1a73e8] text-white rounded-2xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#1557b0] transition-all shadow-lg shadow-[#1a73e8]/20"
          >
            Refresh Matrix
          </button>
        </div>
 
        {/* TACTICAL GRID */}
        <div className="flex-1 p-8 overflow-hidden bg-[var(--bg-primary)]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-[#1a73e8]/20 border-t-[#1a73e8] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] animate-pulse">Aggregating Satellite Intelligence...</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIncidents?.map((inc) => (
                  <div key={inc.id} className="group p-6 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[2rem] hover:bg-[var(--bg-tertiary)] hover:border-[#1a73e8]/50 transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-3">
                         <div className={`w-2 h-2 rounded-full ${inc.status === 'DANGER' ? 'bg-[#d93025] animate-pulse shadow-[0_0_10px_#d93025]' : inc.status === 'WARNING' ? 'bg-[#fbbc05]' : 'bg-[#34a853]'}`}></div>
                         <span className="text-[11px] font-bold text-[var(--text-primary)]/70 uppercase tracking-widest">{inc.location}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]/40">{inc.id}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{inc.type}</h3>
                    <p className="text-sm text-[var(--text-secondary)] font-medium mb-6 leading-relaxed">{inc.impact}</p>
                    
                    <div className="grid grid-cols-2 gap-6 p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--glass-border)]">
                       <div>
                          <p className="text-[9px] font-bold text-[var(--text-secondary)]/40 uppercase tracking-widest mb-1">Status</p>
                          <p className={`text-[12px] font-bold uppercase tracking-tight ${inc.severity === 'CRITICAL' ? 'text-[#d93025]' : 'text-[#fbbc05]'}`}>{inc.severity}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-bold text-[var(--text-secondary)]/40 uppercase tracking-widest mb-1">Response</p>
                          <p className="text-[12px] font-bold text-[#1a73e8] uppercase tracking-tight">{inc.eta}</p>
                       </div>
                    </div>
 
                    <button 
                       onClick={() => addToast(`Established Secure Uplink: ${inc.location}`, 'success')}
                       className="w-full mt-6 flex items-center justify-between px-5 py-3 bg-[var(--bg-primary)] rounded-xl text-[11px] font-bold text-[var(--text-secondary)] group-hover:text-[#1a73e8] group-hover:bg-[#1a73e8]/5 transition-all border border-[var(--glass-border)] group-hover:border-[#1a73e8]/30"
                    >
                       <span className="uppercase tracking-wider">Connect to Grid</span>
                       <Zap className="w-4 h-4 text-[#1a73e8]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
 
        {/* TACTICAL FOOTER */}
        <div className="px-8 py-6 bg-[var(--bg-secondary)] border-t border-[var(--glass-border)] flex items-center justify-between">
           <div className="flex items-center space-x-10">
              <div className="flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 bg-[#34a853] rounded-full shadow-[0_0_8px_#34a853]"></div>
                 <span className="text-[10px] font-bold text-[var(--text-secondary)]/50 uppercase tracking-widest">Satellite Sync: 99.9%</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 bg-[#1a73e8] rounded-full shadow-[0_0_8px_#1a73e8]"></div>
                 <span className="text-[10px] font-bold text-[var(--text-secondary)]/50 uppercase tracking-widest">Global Responder Mesh: 4,850 Online</span>
              </div>
           </div>
           <p className="text-[10px] font-mono text-[var(--text-secondary)]/30 tracking-[0.2em] uppercase">Tactical_Matrix_v7.4 // Secure Link</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalIntelligenceMatrix;
