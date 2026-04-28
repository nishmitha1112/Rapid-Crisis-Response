import React from 'react';
import { ShieldAlert, MapPin, Compass, Navigation } from 'lucide-react';
import { EmergencyResponse } from '../types';

interface EvacuationMapProps {
  response: EmergencyResponse;
}

const EvacuationMap: React.FC<EvacuationMapProps> = ({ response }) => {
  const currentZone = response.log.input.location;
  const assignedRoute = response.route;

  // Localized Hotel/Mall mapping
  const zoneCoords: Record<string, { x: number, y: number }> = {
    'floor1': { x: 30, y: 55 },
    'floor2': { x: 70, y: 30 },
    'lobby': { x: 50, y: 50 },
  };

  const exitCoords: Record<string, { x: number, y: number }> = {
    'Exit A': { x: 15, y: 85 },
    'Emergency Stairs': { x: 82, y: 18 },
    'Exit B': { x: 92, y: 65 },
    'Fire Exit': { x: 45, y: 12 },
    'Main Gate': { x: 50, y: 92 },
    'Side Exit': { x: 5, y: 40 },
  };

  // Tactical Indoor POIs
  const poiData = [
    { name: 'Concierge Desk', x: 48, y: 52 },
    { name: 'Grand Ballroom', x: 25, y: 35 },
    { name: 'Luxury Plaza', x: 75, y: 60 },
    { name: 'Service Elevator', x: 55, y: 45 },
    { name: 'Atrium Lounge', x: 50, y: 25 },
  ];

  const start = zoneCoords[currentZone] || { x: 50, y: 50 };
  const end = exitCoords[assignedRoute] || { x: 10, y: 85 };

  return (
    <div className="relative w-full h-full rounded-[2.5rem] border-4 border-[var(--glass-border)] overflow-hidden group/map shadow-xl bg-slate-50">
      {/* 1. Base floorplan Tier */}
      <div className="absolute inset-0">
         <img 
           src="/hotel_mall_floorplan.png" 
           alt="Hotel Mall Floorplan" 
           className="w-full h-full object-cover opacity-100 transition-opacity duration-700"
         />
      </div>


      {/* 3. Indoor Tactical Interface */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* POI Markers */}
        {poiData.map((poi, i) => (
          <g key={i} className="opacity-80">
            <circle cx={poi.x} cy={poi.y} r="0.6" fill="#64748b" stroke="white" strokeWidth="0.1" />
            <text x={poi.x + 1.5} y={poi.y + 0.5} className="text-[1.8px] fill-slate-600 font-black uppercase tracking-tighter pointer-events-none">{poi.name}</text>
          </g>
        ))}

        {/* Exit Ways */}
        {Object.entries(exitCoords).map(([name, coords]) => {
          const status = response.exit_ways?.[name] || 'SAFE';
          const isAssigned = name === assignedRoute;
          const color = isAssigned ? '#2563eb' : (status === 'SAFE' ? '#059669' : '#dc2626');

          return (
            <g key={name} className="transition-all duration-500">
              <circle cx={coords.x} cy={coords.y} r={isAssigned ? "6" : "4"} fill="none" stroke={color} strokeWidth="0.4" className="opacity-30" />
              <circle cx={coords.x} cy={coords.y} r="1.2" fill={color} stroke="white" strokeWidth="0.2" />
              
              <g transform={`translate(${coords.x}, ${coords.y - 6})`}>
                 <rect x="-12" y="-2.5" width="24" height="5" rx="2.5" fill="white" stroke={isAssigned ? color : "#94a3b8"} strokeWidth="0.6" className="shadow-lg" />
                 <text 
                  className={`text-[2.2px] font-black uppercase tracking-widest ${isAssigned ? 'fill-blue-800' : 'fill-slate-800'}`} 
                  textAnchor="middle" 
                  y="1"
                >
                  {name}
                </text>
              </g>
            </g>
          );
        })}

        {/* High-Visibility Tactical Evacuation Path */}
        {response.path_coords && response.path_coords.length > 0 ? (
          <g>
            <path
              d={`M ${response.path_coords.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-20 blur-md"
            />
            <path
              d={`M ${response.path_coords.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="6, 3"
              className="animate-[dash_6s_linear_infinite]"
              strokeLinecap="round"
              filter="url(#mapGlow)"
            />
          </g>
        ) : (
          <path
            d={`M ${start.x} ${start.y} L ${(start.x + end.x) / 2} ${start.y} L ${end.x} ${end.y}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="6, 3"
            className="animate-[dash_6s_linear_infinite]"
            strokeLinecap="round"
          />
        )}

        {/* 4. TACTICAL STAFF OVERLAY */}
        {response.command_center?.staff.map(staff => (
          <g key={staff.id} transform={`translate(${staff.coords.x}, ${staff.coords.y})`}>
             <circle 
               r="4" 
               fill="none" 
               stroke={staff.status === 'busy' ? '#d97706' : '#2563eb'} 
               strokeWidth="0.1" 
               className="opacity-20" 
             />
             <circle 
               r="0.8" 
               fill={staff.status === 'busy' ? '#d97706' : '#2563eb'} 
             />
             <g transform="translate(0, 2.5)">
                <rect x="-4" y="-1.2" width="8" height="2.4" rx="0.5" fill="white" stroke="#e2e8f0" strokeWidth="0.1" className="shadow-sm" />
                <text className="text-[0.8px] fill-slate-700 font-black uppercase tracking-widest text-center" textAnchor="middle" y="0.4">
                   {staff.id}: {staff.name.split(' ')[0]}
                </text>
             </g>
          </g>
        ))}

        {/* 5. GUEST DENSITY HEATMAP */}
        {response.command_center?.zones.map(zone => {
          const coords = zoneCoords[zone.id.toLowerCase()] || zoneCoords[zone.name.toLowerCase()] || { x: 50, y: 50 };
          const intensity = Math.min(zone.guests_count / 50, 1);
          
          return (
            <g key={zone.id}>
               <circle 
                 cx={coords.x} 
                 cy={coords.y} 
                 r={5 + intensity * 10} 
                 fill={zone.status === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(37, 99, 235, 0.05)'}
               />
               <text x={coords.x} y={coords.y + 1} className="text-[1.2px] fill-slate-400 font-black text-center" textAnchor="middle">
                 {zone.guests_count} GUESTS
               </text>
            </g>
          );
        })}

        {/* User Tracking */}
        <g transform={`translate(${start.x}, ${start.y})`}>
          <circle r="8" fill="none" stroke="#dc2626" strokeWidth="0.2" className="opacity-20" />
          <circle r="1.5" fill="#dc2626" />
          <g transform="translate(0, -10)">
            <rect x="-10" y="-3" width="20" height="6" rx="3" fill="#dc2626" shadow-xl />
            <text className="text-[2.4px] fill-white font-black uppercase tracking-widest text-center" textAnchor="middle" y="1">YOU_ARE_HERE</text>
          </g>
        </g>
      </svg>

      {/* Professional Status Rail */}
      <div className="absolute top-8 left-8 flex items-center space-x-6 p-2 px-5 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg">
        <div className="flex items-center space-x-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">Live Tactical Sync</span>
        </div>
        <div className="w-px h-3 bg-slate-200"></div>
        <div className="flex items-center space-x-2">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Precision: <span className="text-slate-900">±2M</span></span>
        </div>
      </div>

      <div className="absolute bottom-6 right-8 text-right opacity-40 pointer-events-none">
          <p className="text-[7px] font-mono text-slate-400 tracking-[0.4em] uppercase">Tactical_Overlay_v4.2 // ResQAI Spatial Intelligence</p>
      </div>

    </div>
  );
};

export default EvacuationMap;
