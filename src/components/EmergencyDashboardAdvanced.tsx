import React from 'react';
import { Brain, Zap, Target, TrendingUp, Shield, Users, MapPin } from 'lucide-react';
import { EmergencyResponse } from '../types';

interface AdvancedIntelligenceProps {
  response: EmergencyResponse;
}

const AdvancedIntelligence: React.FC<AdvancedIntelligenceProps> = ({ response }) => {
  return (
    <div className="space-y-10">
      {/* Advanced Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Analysis */}
        <div className="relative group lg:col-span-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center space-x-4 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl blur-lg"></div>
                <div className="relative p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30 hover-lift">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight">AI Analysis</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">SITUATION AWARENESS</h3>
                <p className="text-lg font-semibold text-purple-400">{response.situation}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">PREDICTION</h3>
                <p className="text-sm font-medium text-gray-300">{response.prediction}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">ANOMALY DETECTION</h3>
                <p className="text-sm font-medium text-amber-400">{response.anomaly}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="relative group lg:col-span-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center space-x-4 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl blur-lg"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 hover-lift">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full glow-blue"></div>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Performance KPIs</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <h3 className="font-bold text-sm text-gray-400 mb-2 tracking-wider">RESPONSE TIME</h3>
                <p className="text-2xl font-black text-blue-400">{response.kpis.response_time_sec}s</p>
                <p className="text-xs text-gray-500 mt-1">Target: &lt;30s</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-sm text-gray-400 mb-2 tracking-wider">DECISION TIME</h3>
                <p className="text-2xl font-black text-green-400">{response.kpis.time_to_decision_sec}s</p>
                <p className="text-xs text-gray-500 mt-1">Target: &lt;10s</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-sm text-gray-400 mb-2 tracking-wider">SLA COMPLIANCE</h3>
                <p className="text-2xl font-black">{response.kpis.sla_met ? '✓' : '✗'}</p>
                <p className="text-xs text-gray-500 mt-1">{response.kpis.sla_met ? 'Met' : 'Missed'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coordination */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center space-x-4 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-xl blur-lg"></div>
                <div className="relative p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 hover-lift">
                  <Target className="w-6 h-6 text-green-400" />
                  <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full glow-green"></div>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Coordination</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">CRISIS STAGE</h3>
                <p className="text-lg font-semibold text-orange-400">{response.crisis_stage}</p>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">COORDINATION TEAMS</h3>
                <div className="space-y-2">
                  {response.coordination.command.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-red-400" />
                      <span className="text-sm">Command: {response.coordination.command.join(', ')}</span>
                    </div>
                  )}
                  {response.coordination.support.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Support: {response.coordination.support.join(', ')}</span>
                    </div>
                  )}
                  {response.coordination.evacuation.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Evacuation: {response.coordination.evacuation.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative glass-morphism rounded-2xl p-6 hover-lift">
            <div className="flex items-center space-x-4 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl blur-lg"></div>
                <div className="relative p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30 hover-lift">
                  <Shield className="w-6 h-6 text-amber-400" />
                  <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Deployed Resources</h2>
            </div>
            <div className="space-y-3">
              {response.resources.map((resource, index) => (
                <div key={index} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl border border-amber-400/20 hover-lift">
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                    <span className="text-sm font-medium">{resource}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning & Analytics */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative glass-morphism rounded-2xl p-6 hover-lift">
          <div className="flex items-center space-x-4 pb-6 border-b border-white/10 dark:border-white/5 light:border-black/5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-400/30 hover-lift">
                <Brain className="w-6 h-6 text-indigo-400" />
                <div className="absolute -bottom-1 left-1/2 right-1/2 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Learning System</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">ADAPTIVE LEARNING</h3>
              <p className="text-sm font-medium text-indigo-400">{response.learning_status}</p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-400 mb-3 tracking-wider">AFTER-ACTION RECOMMENDATIONS</h3>
              <div className="space-y-2">
                {response.after_action.map((action, index) => (
                  <div key={index} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl border border-indigo-400/20 hover-lift">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                      <span className="text-sm font-medium">{action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedIntelligence;
