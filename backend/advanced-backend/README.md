# Advanced Rapid Crisis Response Backend

## 🚀 Features
- Real-time WebSocket connections
- Comprehensive audit logging with blockchain-style hash chains
- Multi-role incident management
- Lone worker safety check-ins
- Authority feed for legal compliance
- Professional incident workflows
- Zone-based instructions

## 📊 API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /` - API information
- `POST /users` - Create user
- `GET /users` - List all users
- `POST /alerts` - Create incident alert
- `GET /incidents` - List all incidents
- `GET /incidents/{id}` - Get specific incident

### Incident Management
- `POST /incidents/{id}/tasks/{task_id}/complete` - Complete task
- `POST /incidents/{id}/status` - Update incident status
- `POST /status-updates` - Create status update
- `POST /lone-worker-checkins` - Start lone worker check-in
- `POST /lone-worker-checkins/{id}/return` - Complete check-in

### Audit & Compliance
- `GET /audit-log` - View audit trail
- `GET /audit-log/verify` - Verify audit chain integrity
- `GET /authority-feed/{id}` - Authority compliance feed
- `GET /pr-summary/{id}` - PR summary for legal review

### Real-time Communication
- `WebSocket /ws/{channel}` - Real-time updates

## 🛠️ Setup

### Installation
```bash
pip install -r requirements.txt
```

### Running
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8002
```

## 🔒 Security Features

### Audit Trail
- **Cryptographic hash chains** for tamper-proof logging
- **Genesis block** with verifiable integrity
- **Previous hash linking** for complete audit chain
- **SHA-256 encryption** for data integrity

### Role-Based Access
- **8 distinct roles**: guest, staff, security, front_desk, maintenance, manager, authority, legal_pr
- **Zone-based permissions** for location-based access control
- **Device tracking** for endpoint management

### Incident Management
- **6 alert types**: fire, medical, security, weather, maintenance, distress
- **Automated checklists** based on incident type
- **Zone-specific instructions** for targeted response
- **Task completion tracking** with audit logging

## 📡 Real-time Features

### WebSocket Channels
- **Dashboard updates** for all connected clients
- **Zone-specific updates** for location-based notifications
- **Role-based updates** for targeted communications
- **Incident-specific channels** for detailed coordination

### Broadcasting System
- **Multi-channel support** for selective updates
- **Connection management** with automatic cleanup
- **Message acknowledgment** for reliable delivery
- **Error handling** with graceful degradation

## 🏥 Incident Workflows

### Fire Incidents
1. Security: Verify fire source and keep guests away
2. Front Desk: Call emergency services with incident data
3. Staff: Guide guests using zone-specific evacuation
4. Manager: Confirm accountability for staff and high-risk guests

### Medical Incidents
1. Front Desk: Call emergency medical services
2. Security: Clear access route for responders
3. Staff: Bring first-aid kit or AED if available

### Security Incidents
1. Security: Move toward zone and assess safely
2. Front Desk: Lock down sensitive access points
3. Manager: Open command dashboard and coordinate staff

## 🔍 Compliance Features

### Authority Feed
- **Incident details** for legal review
- **Raw sensor data** for forensic analysis
- **Status tracking** for incident lifecycle
- **Real-time updates** for ongoing situations

### PR Summary
- **Draft incident reports** for immediate review
- **Complete timeline** with audit entries
- **Role involvement tracking** for accountability
- **Legal approval status** for compliance

### Lone Worker Safety
- **Risk level assessment** (1-5 scale)
- **Expected return tracking** with timeout monitoring
- **Active check-in management** with automatic alerts
- **Return confirmation** with audit logging

## 📊 Data Models

### User Management
- **Role-based permissions** with zone assignments
- **Device tracking** for endpoint management
- **Online status** with last seen timestamps
- **Real-time updates** via WebSocket

### Incident Tracking
- **Severity levels** (1-5) for prioritization
- **Multi-type support** for different emergency scenarios
- **Checklist automation** based on incident type
- **Zone instructions** for targeted response

### Audit System
- **Immutable hash chains** for tamper protection
- **Complete action logging** with actor tracking
- **Entity relationship tracking** for audit trails
- **Cryptographic verification** for integrity checking

## 🚀 Production Deployment

### Environment Variables
```bash
# For production deployment
export ENVIRONMENT=production
export LOG_LEVEL=info
export CORS_ORIGINS=https://yourdomain.com
```

### Docker Support
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8002
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]
```

### Monitoring
- **Health checks** at `/health`
- **Structured logging** with audit trails
- **Performance metrics** for system monitoring
- **Error handling** with graceful degradation

This backend provides enterprise-grade emergency management with comprehensive security, real-time capabilities, and regulatory compliance features.
