import React from 'react';
import { Activity, Wind, Thermometer, Radio, ExternalLink } from 'lucide-react';
import { RawStreamData } from '../types';

interface RawDataStreamProps {
  data: RawStreamData;
}

const RawDataStream: React.FC<RawDataStreamProps> = ({ data }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative glass-morphism rounded-[2rem] p-8 hover-lift border-blue-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10 dark:border-white/5 light:border-black/5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 hover-lift">
                <Radio className="w-6 h-6 text-blue-400" />
                <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full glow-blue"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Raw Data Streaming</h2>
              <p className="text-xs text-blue-400/70 font-mono tracking-widest uppercase">911 Direct Bridge Active</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter shimmer">LIVE FEED</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Smoke Density (PPM)</span>
                </div>
                <span className="text-2xl font-black text-slate-800 dark:text-white light:text-slate-900">{data.smoke_ppm[data.smoke_ppm.length - 1]}</span>
              </div>
              <div className="flex items-end space-x-1 h-32 pt-4">
                {data.smoke_ppm.map((val, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm transition-all duration-500"
                    style={{ height: `${(val / 150) * 100}%`, opacity: 0.3 + (i / data.smoke_ppm.length) * 0.7 }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] dark:bg-white/5 light:bg-slate-100 rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thermal Gradient</span>
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className={`text-sm font-black ${data.thermal_gradient === 'High' ? 'text-orange-400' : 'text-blue-400'}`}>
                    {data.thermal_gradient}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${data.thermal_gradient === 'High' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'} transition-all duration-1000`}
                  style={{ width: data.thermal_gradient === 'High' ? '85%' : '20%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 group/video">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <div className="absolute top-4 left-4 flex items-center space-x-2 px-2 py-1 bg-black/60 rounded-md backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-red-pulse"></div>
                <span className="text-[10px] font-black text-white dark:text-white light:text-white uppercase tracking-[0.2em] animate-pulse">CAM-04 SECURITY</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center space-y-2">
                    <Radio className="w-8 h-8 text-white/20 mx-auto animate-pulse" />
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Encrypted Meta-Stream</p>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/60">
                {new Date().toISOString()}
              </div>
            </div>

            <div className="bg-blue-500/5 dark:bg-blue-500/10 light:bg-blue-50 rounded-2xl p-5 border border-blue-500/20 shadow-sm">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Authorities Bridge</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
               </div>
               <p className="text-sm font-medium text-slate-600 dark:text-blue-100 light:text-blue-700">{data.external_bridge}</p>
               <div className="mt-4 flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold">911</div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold">FIRE</div>
                  </div>
                  <span className="text-[10px] text-blue-400/60 font-medium">Shared with first responders</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawDataStream;
