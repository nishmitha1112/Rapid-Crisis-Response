import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Info, Home, ShieldAlert, Maximize2, Users, Layout, Crosshair, 
  Box, Layers, Activity, X, Thermometer, Search, Plus, Minus, 
  Map as MapIcon, Satellite, Mic, ShoppingBag, Bed, Landmark, AlertTriangle,
  Shield, Flame, Bus, Train, GraduationCap, School, Stethoscope, Siren, Building2, Zap,
  Globe, Navigation, Loader2, Radio, User, Signal
} from 'lucide-react';
import { EmergencyResponse, Hotspot } from '../types';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../hooks/useTheme';
import GlobalIntelligenceMatrix from './GlobalIntelligenceMatrix';

// Fix Leaflet marker icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface POI {
  id: string;
  label: string;
  type: string;
  lat: number;
  lng: number;
  status: 'STABLE' | 'ALERT' | 'DANGER';
  desc: string;
}

interface DigitalTwinProps {
  data: EmergencyResponse;
  incidentUnit?: string;
  onUnitSelect?: (id: string) => void;
}

// Global Strategic Hubs for Tactical Data Distribution
const GLOBAL_HUBS = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, country: 'USA' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, country: 'India' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' }
];

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Force map to recalculate dimensions to fill container
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, zoom, map]);
  return null;
};

const LivePOILayer = ({ onDataFetched }: { onDataFetched: (pois: POI[]) => void }) => {
  const [loading, setLoading] = useState(false);
  const map = useMap();

  const fetchPOIs = useCallback(async () => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    // Lower threshold to show data earlier
    if (zoom < 9) return;

    setLoading(true);
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](${bbox});
        node["amenity"="hospital"](${bbox});
        node["amenity"="fire_station"](${bbox});
        node["shop"="mall"](${bbox});
        node["tourism"="hotel"](${bbox});
      );
      out body center;
    `;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const newPois: POI[] = data.elements.map((el: any) => {
        const type = el.tags.amenity || el.tags.shop || el.tags.tourism || 'public';
        const name = el.tags.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Location`;
        return {
          id: el.id.toString(),
          label: name,
          type: type === 'fire_station' ? 'fire' : type,
          lat: el.lat || el.center.lat,
          lng: el.lon || el.center.lon,
          status: 'STABLE',
          desc: `${name} is reporting normal status.`
        };
      });

      onDataFetched(newPois);
    } catch (error) {
      console.error("Failed to fetch POIs:", error);
    } finally {
      setLoading(false);
    }
  }, [map, onDataFetched]);

  useMapEvents({
    moveend: () => {
      fetchPOIs();
    }
  });

  useEffect(() => {
    fetchPOIs();
  }, []);

  return loading ? (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--bg-secondary)]/90 backdrop-blur-2xl px-8 py-3 rounded-2xl shadow-2xl border border-[var(--glass-border)] flex items-center space-x-4">
       <Loader2 className="w-5 h-5 text-[#1a73e8] animate-spin" />
       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">Syncing Tactical Grid...</span>
    </div>
  ) : null;
};

const ResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const DigitalTwin: React.FC<DigitalTwinProps> = ({ data, incidentUnit, onUnitSelect }) => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');
  const [mapZoom, setMapZoom] = useState(2.5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]); 
  const [urbanPOIs, setUrbanPOIs] = useState<POI[]>([]);
  const [showGlobalMatrix, setShowGlobalMatrix] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (query: string) => {
    const target = query || searchQuery;
    if (!target.trim()) return;
    
    try {
      addToast(`Searching Tactical Grid: ${target}`, 'info');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(target)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(12);
        addToast(`Vector Lock: ${display_name.split(',')[0]}`, 'success');
      } else {
        addToast('No tactical match found for coordinates.', 'alert');
      }
    } catch (err) {
      addToast('Satellite search link failed.', 'alert');
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Voice modules offline on this browser.", "alert");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      handleSearch(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setIsListening(false);
      addToast(`Mic Error: ${e.error}. Check browser permissions.`, "alert");
    };
    recognition.start();
  };

  // GENERATE COMPREHENSIVE SIMULATED DATA FOR THE WORLD
  const simulatedData = useMemo(() => {
    const incidents: any[] = [];
    const units: any[] = [];

    // Distribute incidents across all global hubs
    GLOBAL_HUBS.forEach((hub, idx) => {
      // 1 Incident per hub for a cleaner global tactical view
      for (let i = 0; i < 1; i++) {
        incidents.push({
          id: `INC-${hub.name}-${i}`,
          label: `INCIDENT ${idx + 1}-${i}: ${hub.name} Sector ${i + 4}`,
          lat: hub.lat + (Math.random() - 0.5) * 4,
          lng: hub.lng + (Math.random() - 0.5) * 4,
          status: Math.random() > 0.7 ? 'DANGER' : 'WARNING',
          severity: Math.random() > 0.5 ? 'CRITICAL' : 'HIGH'
        });
      }

      // 4 Responder units per hub
      for (let i = 0; i < 4; i++) {
        units.push({
          id: `UNIT-${hub.name}-${i}`,
          name: `RESCUE-${hub.name.substring(0, 3).toUpperCase()}-${i+1}`,
          lat: hub.lat + (Math.random() - 0.5) * 5,
          lng: hub.lng + (Math.random() - 0.5) * 5,
          role: i === 0 ? 'Police' : (i === 1 ? 'Medical' : (i === 2 ? 'Fire' : 'Specialist')),
          distance: `${(Math.random() * 15).toFixed(1)}km`
        });
      }
    });

    return { incidents, units };
  }, []);

  const getCustomIcon = (type: string, status: string, isSimulation: boolean = false) => {
    const isDanger = status === 'DANGER' || status === 'WARNING' || status === 'critical' || status === 'risk' || status === 'CRITICAL' || status === 'HIGH';
    const color = isDanger ? '#e11d48' : (type === 'police' ? '#1d4ed8' : type === 'fire' ? '#ea580c' : type === 'hospital' ? '#059669' : type === 'responder' ? '#2563eb' : '#334155');
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="
            width: ${isSimulation ? '44px' : '32px'}; 
            height: ${isSimulation ? '44px' : '32px'}; 
            background: ${isSimulation ? (isDanger ? '#fff1f2' : '#f0f9ff') : 'white'}; 
            border: 2px solid ${color}; 
            border-radius: ${isSimulation ? '50%' : '8px'}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s;
          " class="marker-container">
            <svg width="${isSimulation ? '22' : '16'}" height="${isSimulation ? '22' : '16'}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${type === 'police' ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' : ''}
              ${type === 'hospital' ? '<path d="m12 14 4-4"/><path d="m3.34 19 9.39-9.39a2.83 2.83 0 0 1 4 4L7.34 23"/><path d="m5 16 2 2"/><path d="m19 6.5 3 3"/><path d="m10 21 8-8"/><path d="m14 5 3 3"/><path d="m3 11 3-3"/><path d="m9.5 2 3 3"/><path d="m19 10-4 4"/><path d="m2 14.5 3-3"/>' : ''}
              ${type === 'fire' ? '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 3.333 3 5 1.333 2.222.5 4.583-1.5 6"/><path d="M15.833 16.5c2.167-2.167 1.5-5.5 0-7.167l-2 2c.5 1 0 3-2 3s-1.5 1-1.5 2c0 .667.667 1.5 1.5 1.5h4c.833 0 1.5-.833 1.5-1.5Z"/>' : ''}
              ${type === 'emergency' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' : ''}
              ${type === 'responder' ? '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' : ''}
              ${type === 'mall' ? '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>' : ''}
              ${type === 'hotel' ? '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>' : ''}
              ${type !== 'police' && type !== 'hospital' && type !== 'fire' && type !== 'emergency' && type !== 'responder' && type !== 'mall' && type !== 'hotel' ? '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>' : ''}
            </svg>
          </div>
          <div style="
            width: 0; 
            height: 0; 
            border-left: 5px solid transparent; 
            border-right: 5px solid transparent; 
            border-top: 7px solid ${color}; 
            margin-top: -1px;
          "></div>
          ${isDanger ? `<div style="position: absolute; inset: -15px; background: ${color}; border-radius: 50%; opacity: 0.15; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        </div>
      `,
      iconSize: [isSimulation ? 44 : 32, isSimulation ? 52 : 40],
      iconAnchor: [isSimulation ? 22 : 16, isSimulation ? 52 : 40],
    });
  };

  const handleReset = () => {
    setMapCenter([20, 0]);
    setMapZoom(2.5);
    addToast('Global Tactical Grid Reset', 'info');
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-[var(--bg-primary)] overflow-hidden group">
      
      {/* SEARCH BAR */}
      <div className="absolute top-6 left-6 z-[1500] flex items-center w-full max-w-lg pointer-events-auto">
        <div className="flex items-center w-full bg-[var(--bg-primary)] rounded-xl shadow-md border border-[var(--glass-border)] overflow-hidden group focus-within:border-[#1a73e8] transition-all">
          <button 
            onClick={() => handleSearch(searchQuery)}
            className="p-3.5 pl-5 text-[#5f6368] hover:text-[#1a73e8] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Scanning Tactical Vectors..." 
            className="flex-1 bg-transparent border-none outline-none text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] tracking-tight"
          />
          <div className="h-6 w-px bg-[var(--glass-border)] mx-2"></div>
          <button 
            onClick={() => setShowGlobalMatrix(true)}
            className="px-4 py-2 bg-[#f1f3f4] dark:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg text-[12px] font-bold uppercase tracking-wider hover:bg-[#e8eaed] transition-all active:scale-95 flex items-center space-x-2 mr-2"
          >
            <Globe className="w-4 h-4" />
            <span>Matrix</span>
          </button>
          <button 
            onClick={startVoiceSearch}
            className={`p-3.5 pr-5 transition-colors ${isListening ? 'text-[#d93025] animate-pulse' : 'text-[#5f6368] hover:text-[var(--text-primary)]'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TACTICAL STATUS */}
      <div className="absolute top-6 left-[540px] z-[1500] hidden 2xl:flex items-center space-x-4 pointer-events-none">
         <div className="px-5 py-2.5 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl shadow-md flex items-center space-x-4 border border-[var(--glass-border)]">
            <div className="flex items-center space-x-2">
               <div className="w-1.5 h-1.5 bg-[#d93025] rounded-full animate-pulse shadow-sm"></div>
               <span className="text-[12px] font-bold uppercase tracking-wider">{simulatedData.incidents.length} CRITICAL</span>
            </div>
            <div className="w-px h-5 bg-[var(--glass-border)]"></div>
            <div className="flex items-center space-x-2">
               <div className="w-1.5 h-1.5 bg-[#1a73e8] rounded-full shadow-sm"></div>
               <span className="text-[12px] font-bold uppercase tracking-wider">{simulatedData.units.length} ACTIVE</span>
            </div>
         </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute top-6 right-6 z-[1500] flex flex-col space-y-2 pointer-events-auto">
        <div className="bg-[var(--bg-primary)] rounded-xl shadow-md border border-[var(--glass-border)] overflow-hidden flex flex-col">
          <button onClick={() => setMapType('street')} className={`p-3 border-b border-[var(--glass-border)] transition-all transform active:scale-90 ${mapType === 'street' ? 'text-[#1a73e8] bg-[#1a73e8]/10' : 'text-[#5f6368] hover:text-[var(--text-primary)]'}`}>
            <MapIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setMapType('satellite')} className={`p-3 transition-all transform active:scale-90 ${mapType === 'satellite' ? 'text-[#1a73e8] bg-[#1a73e8]/10' : 'text-[#5f6368] hover:text-[var(--text-primary)]'}`}>
            <Satellite className="w-5 h-5" />
          </button>
        </div>
        <button onClick={handleReset} className="w-11 h-11 bg-[var(--bg-primary)] rounded-xl shadow-md border border-[var(--glass-border)] flex items-center justify-center text-[#5f6368] hover:text-[#1a73e8] transition-all transform active:scale-90">
          <Crosshair className="w-6 h-6" />
        </button>
      </div>

      {/* MAP CONTAINER */}
      <div className="relative flex-1 bg-[var(--bg-secondary)] overflow-hidden">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          zoomControl={false} 
          style={{ height: '100%', width: '100%', background: 'var(--bg-primary)' }}
          minZoom={2}
          zoomSnap={0.5}
          zoomDelta={0.5}
          dragging={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          touchZoom={true}
          worldCopyJump={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <ResizeHandler />
          
          <TileLayer
            url={mapType === 'satellite' 
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"}
            attribution='&copy; ESRI &copy; ResQAI'
            noWrap={true}
            bounds={[[ -90, -180], [90, 180]]}
          />

          <LivePOILayer onDataFetched={(newPois) => setUrbanPOIs(newPois)} />

          {/* RENDER ALL SIMULATED INCIDENTS ACROSS THE WORLD */}
          {simulatedData.incidents.map((hotspot) => (
            <Marker key={hotspot.id} position={[hotspot.lat, hotspot.lng]} icon={getCustomIcon('emergency', hotspot.status, true)}>
              <Popup className="tactical-popup">
                <div className="p-2">
                   <h4 className="font-black uppercase text-rose-600 mb-1 leading-tight">{hotspot.label}</h4>
                   <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${hotspot.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                         {hotspot.severity} SEVERITY
                      </span>
                   </div>
                   <p className="text-[9px] text-slate-500 mt-2 font-medium">GPS: {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* RENDER ALL RESPONDER UNITS ACROSS THE WORLD */}
          {simulatedData.units.map((unit) => (
            <Marker key={unit.id} position={[unit.lat, unit.lng]} icon={getCustomIcon('responder', 'stable', true)}>
              <Popup>
                <div className="p-1">
                   <h4 className="font-black text-blue-600 text-[10px] uppercase">{unit.name}</h4>
                   <p className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">{unit.role} TEAM</p>
                   <p className="text-[8px] font-medium text-slate-500 mt-0.5">EST. ETA: {unit.distance}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* TACTICAL LINKS (LINES BETWEEN UNITS AND INCIDENTS) */}
          {simulatedData.incidents.slice(0, 10).map((inc, i) => {
             const unit = simulatedData.units[i];
             if (!unit) return null;
             return (
               <Polyline 
                 key={`link-${i}`} 
                 positions={[[inc.lat, inc.lng], [unit.lat, unit.lng]]} 
                 pathOptions={{ color: '#1a73e8', weight: 1, dashArray: '5, 10', opacity: 0.3 }} 
               />
             );
          })}

          {/* RENDER DYNAMIC PUBLIC POIs */}
          {urbanPOIs.map((poi) => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getCustomIcon(poi.type, poi.status)}>
              <Popup>
                <div className="p-1">
                   <h4 className="font-black uppercase text-[10px] text-slate-900">{poi.label}</h4>
                   <p className="text-[9px] text-slate-600">{poi.desc}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          <ZoomControl position="topright" />
        </MapContainer>

        {/* HUD BLUEPRINT GRID */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay z-[500]" style={{ backgroundImage: 'radial-gradient(circle, rgba(0, 100, 255, 0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {showGlobalMatrix && <GlobalIntelligenceMatrix onClose={() => setShowGlobalMatrix(false)} />}
    </div>
  );
};

export default DigitalTwin;
