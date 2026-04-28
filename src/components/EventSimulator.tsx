import React, { useState } from 'react';
import { AlertTriangle, Users, MapPin, Play, RotateCcw, Zap, Shield, Activity, ChevronDown } from 'lucide-react';
import { EmergencyEvent } from '../types';

interface EventSimulatorProps {
  onSimulate: (event: EmergencyEvent) => void;
  loading: boolean;
}

const EventSimulator: React.FC<EventSimulatorProps> = ({ onSimulate, loading }) => {
  const [event, setEvent] = useState<EmergencyEvent>({
    sos: false,
    sensor: false,
    crowd: false,
    location: 'floor1',
    network_available: true,
    routing_preference: 'fastest',
    users: [
      { id: 'staff1', type: 'staff', distance: 2 },
      { id: 'staff2', type: 'staff', distance: 10 },
      { id: 'guest1', type: 'guest', distance: 4 },
      { id: 'guest2', type: 'guest', vulnerable: true, distance: 15 },
    ]
  });

  const handleSimulate = () => {
    onSimulate(event);
  };

  const handleReset = () => {
    setEvent({
      sos: false,
      sensor: false,
      crowd: false,
      location: 'floor1',
      network_available: true,
      routing_preference: 'fastest',
      users: [
        { id: 'staff1', type: 'staff', distance: 2 },
        { id: 'staff2', type: 'staff', distance: 10 },
        { id: 'guest1', type: 'guest', distance: 4 },
        { id: 'guest2', type: 'guest', vulnerable: true, distance: 15 },
      ]
    });
  };

  const presets = [
    {
      name: 'Fire Emergency',
      config: { sos: true, sensor: true, crowd: false, location: 'floor2' }
    },
    {
      name: 'Crowd Panic',
      config: { sos: false, sensor: false, crowd: true, location: 'lobby' }
    },
    {
      name: 'Technical Alert',
      config: { sos: false, sensor: true, crowd: false, location: 'floor1' }
    },
    {
      name: 'Full Emergency',
      config: { sos: true, sensor: true, crowd: true, location: 'floor1', network_available: true }
    },
    {
      name: 'Network Outage',
      config: { sos: true, sensor: true, crowd: false, location: 'floor2', network_available: false }
    },
    {
      name: 'Lone Worker Alert',
      config: { sos: false, sensor: false, crowd: false, location: 'floor1', network_available: true }
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setEvent(prev => ({
      ...prev,
      ...preset.config
    }));
  };

  return (
    <div className="relative">
      <div className="card p-6 md:p-8">
        <div className="flex items-center space-x-4 pb-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center justify-center w-10 h-10 bg-[#fef7e0] rounded-full">
            <AlertTriangle className="w-5 h-5 text-[#ea4335]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[var(--text-primary)]">Tactical Simulator</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Emergency Scenario Testing</p>
          </div>
        </div>

      {/* Operational Presets */}
      <div className="mt-8 mb-8">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Operational Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="btn-secondary text-sm"
            >
              <span className="relative z-10">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Event Configuration */}
      <div className="space-y-6">
        {/* Triggers */}
        <div>
          <div className="flex items-center space-x-2 pb-3">
            <AlertTriangle className="w-4 h-4 text-[#ea4335]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Emergency Triggers</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 'sos', label: 'SOS Signal Activated' },
              { id: 'sensor', label: 'Sensor Triggered (Smoke/Heat/Gas)' },
              { id: 'crowd', label: 'High Crowd Density Detected' },
              { id: 'network_available', label: 'Primary Network Cloud Connectivity' }
            ].map((trigger) => (
              <label key={trigger.id} className="flex items-center space-x-4 cursor-pointer group/label">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={(event as any)[trigger.id]}
                    onChange={(e) => setEvent(prev => ({ ...prev, [trigger.id]: e.target.checked }))}
                    className="peer w-5 h-5 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-md checked:bg-[#1a73e8] checked:border-[#1a73e8] transition-all appearance-none cursor-pointer"
                  />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none scale-50 peer-checked:scale-100 transition-transform">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-[var(--text-secondary)] group-hover/label:text-[var(--text-primary)] transition-colors">{trigger.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Routing Preference */}
        <div>
          <div className="flex items-center space-x-2 pb-3">
            <Activity className="w-4 h-4 text-[#1a73e8]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Initial Routing Strategy</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <button
               onClick={() => setEvent(prev => ({ ...prev, routing_preference: 'fastest' }))}
               className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${event.routing_preference === 'fastest' ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]' : 'bg-[var(--bg-primary)] border-[var(--glass-border)] text-[var(--text-secondary)]'}`}
             >
               <Zap className="w-4 h-4" />
               <span className="text-sm font-medium">Fastest</span>
             </button>
             <button
               onClick={() => setEvent(prev => ({ ...prev, routing_preference: 'safest' }))}
               className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${event.routing_preference === 'safest' ? 'bg-[#e6f4ea] border-[#34a853] text-[#137333]' : 'bg-[var(--bg-primary)] border-[var(--glass-border)] text-[var(--text-secondary)]'}`}
             >
               <Shield className="w-4 h-4" />
               <span className="text-sm font-medium">Safest</span>
             </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center space-x-2 pb-3">
            <MapPin className="w-4 h-4 text-[#34a853]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Incident Location</h3>
          </div>
          <div className="relative">
            <select
              value={event.location}
              onChange={(e) => setEvent(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-lg outline-none focus:border-[#1a73e8] transition-all appearance-none text-sm cursor-pointer"
            >
              <option value="floor1">Floor 1 - North Wing</option>
              <option value="floor2">Floor 2 - East Wing</option>
              <option value="lobby">Lobby - Central Area</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f6368]">
               <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Personnel */}
        <div>
          <div className="flex items-center space-x-2 pb-3">
            <Users className="w-4 h-4 text-[#1a73e8]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Personnel in Area</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--glass-border)]">
              <span className="text-sm text-[var(--text-secondary)]">Staff Members:</span>
              <span className="text-sm font-medium text-[#1a73e8]">
                {event.users?.filter(u => u.type === 'staff').length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--glass-border)]">
              <span className="text-sm text-[var(--text-secondary)]">Guests:</span>
              <span className="text-sm font-medium text-[#34a853]">
                {event.users?.filter(u => u.type === 'guest').length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--glass-border)]">
              <span className="text-sm text-[var(--text-secondary)]">Vulnerable Persons:</span>
              <span className="text-sm font-medium text-[#fbbc05]">
                {event.users?.filter(u => u.vulnerable).length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-6 mt-4 border-t border-[var(--glass-border)]">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Engage Simulation'}</span>
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary px-4"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EventSimulator;
