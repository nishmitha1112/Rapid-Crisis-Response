# Advanced Emergency Management Backend

## 🚀 Intelligence Layer Features

This FastAPI backend implements a sophisticated emergency management system with advanced intelligence capabilities:

### 🧠 Core Intelligence Features

**Smart Decision Engine**
- Multi-factor confidence scoring (SOS, sensor, crowd detection)
- Dynamic status determination (CRITICAL/MODERATE/LOW)
- Escalation engine with location-based event history
- Adaptive learning from past incidents

**Advanced Analytics**
- Risk type detection (Fire Hazard, Crowd Panic, Technical Alert)
- Predictive modeling for next state scenarios
- Anomaly detection for hidden hazards
- Situational awareness with multi-source correlation

**Resource Management**
- Dynamic role assignment based on incident severity
- Resource allocation optimization
- Coordination planning for command/support/evacuation teams
- Vulnerable person prioritization

**Communication & Coordination**
- Multi-channel communication (SMS, Mobile App, Email, Alarms)
- Context-aware alerts for different user types
- Shared awareness across all stakeholders
- Crisis stage management

### 🔬 Technical Capabilities

**Real-time Processing**
- Sub-5-second decision making
- Immediate response coordination
- SLA monitoring and compliance
- KPI tracking and performance metrics

**AI Integration**
- Computer vision smoke detection
- Pattern recognition for crowd behavior
- Automated decision justification
- Learning system for continuous improvement

**System Resilience**
- Offline mode support
- Network failure handling
- Human override capabilities
- Governance and ethical compliance

### 📊 Data Intelligence

**Environmental Monitoring**
- Real-time sensor data (temperature, smoke, gas)
- Zone-based risk assessment
- Spatial mapping and routing
- Impact time estimation

**Event Analytics**
- Incident playback and review
- Action sequence optimization
- Risk-action mapping
- After-action recommendations

### 🚀 API Endpoints

### GET `/`
Health check endpoint
```json
{"message": "Intelligence Layer Running"}
```

### POST `/process`
Advanced emergency event processing
```json
{
  "confidence": 85,
  "status": "CRITICAL",
  "roles": {"user1": "Emergency Commander"},
  "route": "Emergency Stairs",
  "alert": "CRITICAL emergency detected at floor1",
  "checklist": ["Alert emergency services", "Activate fire suppression"],
  "priority_tasks": ["Alert emergency services", "Activate fire suppression"],
  "zone_actions": {"floor1": "EVACUATE IMMEDIATELY"},
  "risk_type": "Fire Hazard",
  "crowd_status": "High Density Crowd",
  "response_time": "Immediate (0-2 min)",
  "explanation": ["SOS signal detected", "Sensor triggered"],
  "sensor_data": {"temperature": 75, "smoke_level": 60, "gas_level": 20},
  "situation": "Severe with active hazard",
  "prediction": "High risk of escalation or spread",
  "resources": ["Fire Team", "Medical Team", "Security Team"],
  "decision_confidence": "High Confidence",
  "coordination": {"command": ["user1"], "support": [], "evacuation": []},
  "kpis": {"response_time_sec": 30, "time_to_decision_sec": 5, "sla_met": true},
  "incident_id": "uuid-generated-id",
  "spatial_info": {"zone": "North Wing", "risk_level": "High"}
}
```

### 🎯 Intelligence Algorithms

**Confidence Scoring**
- SOS Signal: +50 points
- Sensor Trigger: +30 points
- Crowd Detection: +20 points
- SOS + Sensor Combo: +10 bonus
- Crowd without SOS: -10 penalty

**Status Determination**
- Score ≥80: CRITICAL
- Score ≥50: MODERATE
- Score <50: LOW

**Escalation Logic**
- 3+ events at same location → Auto-escalate to CRITICAL
- Location-based event history tracking
- Prevents underestimation of recurring incidents

### 🔧 Installation & Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 🌟 Enterprise Features

**Multi-Stakeholder Support**
- Emergency Services integration
- Hotel Management coordination
- Guest communication systems
- Security team management

**Advanced Reporting**
- Incident playback capabilities
- Action sequence documentation
- Risk assessment reports
- Performance KPI tracking

**System Integration**
- Fire system integration
- Police and medical services
- Mobile app connectivity
- Alarm system control

**Ethical Governance**
- Human safety prioritization
- Manual override capabilities
- Transparency in decision making
- Compliance with emergency protocols

This backend provides the intelligence foundation for the impressive frontend, delivering enterprise-grade emergency management with cutting-edge AI and decision-making capabilities.
