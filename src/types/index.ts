export interface EmergencyEvent {
  sos: boolean;
  sensor: boolean;
  crowd: boolean;
  location: string;
  network_available?: boolean;
  routing_preference?: 'safest' | 'fastest';
  users?: Array<{
    id: string;
    type: string;
    distance: number;
    vulnerable?: boolean;
  }>;
}

export interface GroupMember {
  id: string;
  name: string;
  relation: string;
  location: string;
  status: 'safe' | 'evacuating' | 'unknown' | 'assistance_needed';
  last_seen: string;
  avatar: string;
}

export interface Hotspot {
  id: string;
  label: string;
  coords: { x: number; y: number };
  status: 'SAFE' | 'DANGER' | 'WARNING';
}

export interface DigitalTwinData {
  map_url: string;
  hotspots: Hotspot[];
}

export interface BlockchainEntry {
  timestamp: string;
  hash: string;
  prev_hash: string;
  event_type: string;
  details: string;
}

export interface SOPStep {
  id: string;
  task: string;
  completed: boolean;
  mandatory: boolean;
}

export interface SOPData {
  version: string;
  last_updated: string;
  steps: SOPStep[];
}

export interface PRNarrative {
  headline: string;
  body: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_LEGAL';
  timeline_summary: string[];
}

export interface RawStreamData {
  smoke_ppm: number[];
  thermal_gradient: string;
  camera_feed: string;
  external_bridge: string;
}

export interface ResilienceData {
  mode: 'CLOUD_SYNC' | 'AD_HOC_MESH';
  status: string;
  peer_count: number;
}

export interface EmergencyResponse {
  confidence: number;
  status: string;
  roles: Record<string, string>;
  route: string;
  path_coords: { x: number; y: number }[];
  exit_ways?: Record<string, string>;
  alert: string;
  checklist: string[];
  priority_tasks: string[];
  zone_actions: string[];
  risk_type: string;
  proximity_alerts: string[];
  crowd_status: string;
  response_time: string;
  explanation: string[];
  log: {
    event: string;
    timestamp: string;
    input: {
      sos: boolean;
      sensor: boolean;
      crowd: boolean;
      location: string;
    };
    decision: {
      confidence: number;
      status: string;
      route: string;
    };
    roles_assigned: Record<string, string>;
  };
  sensor_data: any;
  report: string;
  timeline: string[];
  situation: string;
  prediction: string;
  resources: string[];
  decision_confidence: string;
  coordination: {
    command: string[];
    support: string[];
    evacuation: string[];
  };
  justification: string;
  learning_status: string;
  anomaly: string;
  acknowledgment: string;
  channels: string[];
  crisis_stage: string;
  stakeholders: string[];
  priority_level: string;
  final_decision: string;
  time_to_impact: string;
  context_alerts: string[];
  reliability: string;
  auto_actions: string[];
  shared_awareness: string;
  kpis: any;
  after_action: string[];
  special_support: string[];
  incident_id: string;
  playback: any;
  risk_action_map: any;
  action_sequence: any;
  spatial_info: {
    unit: string;
    [key: string]: any;
  };
  blockchain_log: BlockchainEntry[];
  group_tracking?: {
    group_id: string;
    members: GroupMember[];
    invite_code: string;
  };
  digital_twin: DigitalTwinData;
  raw_stream: RawStreamData;
  active_sop: SOPData;
  pr_narrative: PRNarrative;
  lone_worker_alerts: string[];
  resilience: ResilienceData;
  guest_features?: {
    localized_sensors: {
      temp: string;
      air_quality: string;
      visibility: string;
    };
    safety_checklist: {
      id: number;
      task: string;
      priority: string;
    }[];
    emergency_contacts: {
      role: string;
      phone: string;
    }[];
  };
  active_assistance?: AssistanceRequest;
  command_center?: CommandCenterData;
  global_admin?: GlobalAdminData;
  responder_data?: ResponderData;
}

export interface ResponderBio {
  heart_rate: number;
  stress_level: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  oxygen_level: number; // For air tanks
  exposure_time: string;
}

export interface EquipmentInfo {
  id: string;
  type: string;
  status: 'AVAILABLE' | 'IN_USE' | 'DEPLETED';
  location: string;
  distance: string;
}

export interface NavStep {
  instruction: string;
  distance: string;
  hazard?: string;
}

export interface ResponderData {
  next_best_action: {
    task: string;
    target: string;
    distance: string;
    eta: string;
    hazard_warning?: string;
  };
  navigation: NavStep[];
  biometrics: ResponderBio;
  nearby_teams: {
    id: string;
    name: string;
    role: string;
    distance: string;
  }[];
  nearby_equipment: EquipmentInfo[];
  hazard_predictions: {
    type: string;
    timer: string;
    action: string;
  }[];
  micro_sop: string[];
  mission_status: {
    objective: string;
    progress: number;
  };
}

export interface SiteInfo {
  id: string;
  name: string;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  location: { lat: number; lng: number };
  active_incidents: number;
}

export interface AIRecommendation {
  id: string;
  type: 'EVACUATION' | 'SYSTEM' | 'SECURITY';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action_label: string;
}

export interface SystemHealth {
  sensors: { online: number; offline: number; faulty: number };
  network: { status: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE'; latency: string };
  cameras: { active: number; total: number };
}

export interface PredictiveSim {
  time_horizon: string;
  fire_prediction: string;
  evac_outcome: string;
  bottleneck_prediction: string;
}

export interface GlobalAdminData {
  sites: SiteInfo[];
  active_site_id: string;
  recommendations: AIRecommendation[];
  system_health: SystemHealth;
  predictive_sim: PredictiveSim;
  compliance: {
    osha_alignment: number;
    nfpa_status: string;
    audit_log_hash: string;
  };
  escalation_level: 1 | 2 | 3;
  autonomous_mode: 'MANUAL' | 'ASSISTED' | 'AUTONOMOUS';
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'in_danger';
  sub_status?: string;
  location: string;
  coords: { x: number; y: number };
}

export interface ZoneStatus {
  id: string;
  name: string;
  status: 'safe' | 'risk' | 'critical';
  staff_assigned: string[];
  guests_count: number;
  evacuation_progress: number;
}

export interface CommandCenterData {
  staff: StaffMember[];
  zones: ZoneStatus[];
  fire_spread: {
    origin: string;
    affected_zones: string[];
    rate: string;
  };
  evacuation_stats: {
    total_guests: number;
    evacuated_count: number;
    remaining_count: number;
    progress_percentage: number;
  };
  active_risks: {
    type: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  iot_controls: {
    fire_suppression: boolean;
    door_locks: Record<string, 'locked' | 'unlocked'>;
    elevators: 'active' | 'override';
    ventilation: 'normal' | 'smoke_extraction';
  };
  operational_tasks: {
    id: string;
    owner: string;
    task: string;
    status: 'pending' | 'in_progress' | 'done';
    due_time: string;
    overdue: boolean;
  }[];
  ai_suggestions: string[];
  timeline_log: {
    time: string;
    event: string;
    type: 'auto' | 'manual';
  }[];
  resources: {
    id: string;
    type: string;
    status: 'available' | 'depleted' | 'in_use';
    location: string;
  }[];
}

export interface AssistanceRequest {
  id: string;
  type: 'medical' | 'fire' | 'security' | 'other';
  status: 'sent' | 'received' | 'en_route' | 'arrived';
  timestamp: string;
  location: string;
  chat_log: {
    sender: 'user' | 'responder';
    message: string;
    time: string;
  }[];
}
