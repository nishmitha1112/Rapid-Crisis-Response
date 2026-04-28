from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from hashlib import sha256
from json import dumps
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="Rapid Crisis Response Backend",
    description="Member 3 backend: APIs, real-time broadcasting, users, incidents, and audit logging.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Role(str, Enum):
    guest = "guest"
    staff = "staff"
    security = "security"
    front_desk = "front_desk"
    maintenance = "maintenance"
    manager = "manager"
    authority = "authority"
    legal_pr = "legal_pr"


class AlertType(str, Enum):
    fire = "fire"
    medical = "medical"
    security = "security"
    weather = "weather"
    maintenance = "maintenance"
    distress = "distress"


class IncidentStatus(str, Enum):
    active = "active"
    contained = "contained"
    resolved = "resolved"


class UserCreate(BaseModel):
    name: str = Field(min_length=1)
    role: Role
    zone: str = Field(examples=["floor-4", "lobby", "basement"])
    device_id: str | None = None


class User(UserCreate):
    id: str
    last_seen: datetime
    online: bool = True


class AlertCreate(BaseModel):
    type: AlertType
    zone: str
    severity: int = Field(ge=1, le=5)
    reported_by: str
    description: str
    raw_data: dict[str, Any] = Field(default_factory=dict)


class ChecklistTask(BaseModel):
    id: str
    role: Role
    instruction: str
    zone: str
    completed: bool = False
    completed_by: str | None = None
    completed_at: datetime | None = None


class Incident(BaseModel):
    id: str
    type: AlertType
    zone: str
    severity: int
    status: IncidentStatus = IncidentStatus.active
    reported_by: str
    description: str
    raw_data: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    checklist: list[ChecklistTask]
    instructions_by_zone: dict[str, str]


class TaskComplete(BaseModel):
    user_id: str


class IncidentStatusUpdate(BaseModel):
    actor_id: str
    status: IncidentStatus


class StatusUpdate(BaseModel):
    user_id: str
    zone: str | None = None
    message: str
    raw_data: dict[str, Any] = Field(default_factory=dict)


class LoneWorkerCheckInCreate(BaseModel):
    user_id: str
    location: str
    risk_level: int = Field(ge=1, le=5)
    expected_return_minutes: int = Field(ge=1, le=240)


class LoneWorkerCheckIn(BaseModel):
    id: str
    user_id: str
    location: str
    risk_level: int
    expected_return_minutes: int
    started_at: datetime
    returned_at: datetime | None = None
    active: bool = True


class AuditEntry(BaseModel):
    id: str
    timestamp: datetime
    actor: str
    action: str
    entity_type: str
    entity_id: str
    payload: dict[str, Any]
    previous_hash: str
    hash: str


class AuditVerification(BaseModel):
    valid: bool
    entries_checked: int
    broken_entry_id: str | None = None


users: dict[str, User] = {}
incidents: dict[str, Incident] = {}
checkins: dict[str, LoneWorkerCheckIn] = {}
audit_log: list[AuditEntry] = []


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, channel: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.setdefault(channel, []).append(websocket)

    def disconnect(self, channel: str, websocket: WebSocket) -> None:
        if channel in self.active and websocket in self.active[channel]:
            self.active[channel].remove(websocket)

    async def broadcast(self, channels: list[str], event: dict[str, Any]) -> None:
        seen: set[int] = set()
        for channel in channels:
            for websocket in list(self.active.get(channel, [])):
                if id(websocket) in seen:
                    continue
                seen.add(id(websocket))
                try:
                    await websocket.send_json(event)
                except Exception:
                    self.disconnect(channel, websocket)


manager = ConnectionManager()


def now() -> datetime:
    return datetime.now(timezone.utc)


def calculate_audit_hash(
    entry_id: str,
    timestamp: datetime,
    actor: str,
    action: str,
    entity_type: str,
    entity_id: str,
    payload: dict[str, Any],
    previous_hash: str,
) -> str:
    audit_basis = {
        "id": entry_id,
        "timestamp": timestamp.isoformat(),
        "actor": actor,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "payload": payload,
        "previous_hash": previous_hash,
    }
    return sha256(dumps(audit_basis, sort_keys=True, default=str).encode("utf-8")).hexdigest()


def add_audit(
    actor: str,
    action: str,
    entity_type: str,
    entity_id: str,
    payload: dict[str, Any],
) -> AuditEntry:
    previous_hash = audit_log[-1].hash if audit_log else "GENESIS"
    timestamp = now()
    entry_id = str(uuid4())
    entry_hash = calculate_audit_hash(
        entry_id=entry_id,
        timestamp=timestamp,
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        payload=payload,
        previous_hash=previous_hash,
    )
    entry = AuditEntry(
        id=entry_id,
        timestamp=timestamp,
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        payload=payload,
        previous_hash=previous_hash,
        hash=entry_hash,
    )
    audit_log.append(entry)
    return entry


def verify_audit_chain() -> AuditVerification:
    previous_hash = "GENESIS"
    for entry in audit_log:
        expected_hash = calculate_audit_hash(
            entry_id=entry.id,
            timestamp=entry.timestamp,
            actor=entry.actor,
            action=entry.action,
            entity_type=entry.entity_type,
            entity_id=entry.entity_id,
            payload=entry.payload,
            previous_hash=entry.previous_hash,
        )
        if entry.previous_hash != previous_hash or entry.hash != expected_hash:
            return AuditVerification(
                valid=False,
                entries_checked=len(audit_log),
                broken_entry_id=entry.id,
            )
        previous_hash = entry.hash
    return AuditVerification(valid=True, entries_checked=len(audit_log))


def build_checklist(alert: AlertCreate) -> list[ChecklistTask]:
    playbooks: dict[AlertType, list[tuple[Role, str]]] = {
        AlertType.fire: [
            (Role.security, "Verify fire source and keep guests away from affected zone."),
            (Role.front_desk, "Call emergency services and share incident ID plus raw sensor data."),
            (Role.staff, "Guide nearby guests using the zone-specific evacuation instruction."),
            (Role.manager, "Confirm accountability status for staff and high-risk guests."),
        ],
        AlertType.medical: [
            (Role.front_desk, "Call emergency medical services with exact location and symptoms."),
            (Role.security, "Clear access route for responders."),
            (Role.staff, "Bring first-aid kit or AED if available."),
        ],
        AlertType.security: [
            (Role.security, "Move toward reported zone and assess from a safe distance."),
            (Role.front_desk, "Lock down sensitive access points and prepare authority handoff."),
            (Role.manager, "Open command dashboard and coordinate staff roles."),
        ],
        AlertType.weather: [
            (Role.staff, "Move guests away from glass and exposed outdoor areas."),
            (Role.maintenance, "Check backup power and vulnerable infrastructure."),
            (Role.manager, "Confirm shelter zones are staffed."),
        ],
        AlertType.maintenance: [
            (Role.maintenance, "Inspect hazard and isolate affected equipment if safe."),
            (Role.staff, "Redirect guests away from the impacted area."),
        ],
        AlertType.distress: [
            (Role.security, "Locate the distressed person and confirm immediate risk."),
            (Role.manager, "Assign a second staff member for support and escalation."),
        ],
    }

    return [
        ChecklistTask(id=str(uuid4()), role=role, instruction=instruction, zone=alert.zone)
        for role, instruction in playbooks[alert.type]
    ]


def build_zone_instructions(alert: AlertCreate) -> dict[str, str]:
    if alert.type == AlertType.fire:
        return {
            alert.zone: "Evacuate using the nearest safe stairwell. Avoid elevators.",
            "above-" + alert.zone: "Stay put until staff confirms a safe route.",
            "below-" + alert.zone: "Evacuate calmly through the primary exit.",
        }
    if alert.type == AlertType.security:
        return {
            alert.zone: "Shelter in place, lock doors if possible, and stay away from corridors.",
            "nearby": "Move away from the affected zone and await staff instructions.",
        }
    return {alert.zone: "Follow staff instructions and monitor this screen for updates."}


def event_channels_for_incident(incident: Incident) -> list[str]:
    role_channels = [f"role:{task.role.value}" for task in incident.checklist]
    return ["dashboard", f"zone:{incident.zone}", *role_channels]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "message": "Rapid Crisis Response Backend is running",
        "docs": "/docs",
        "health": "/health",
        "main_endpoints": ["/users", "/alerts", "/incidents", "/audit-log"],
    }


@app.post("/users", response_model=User, status_code=201)
async def create_user(payload: UserCreate) -> User:
    user = User(id=str(uuid4()), last_seen=now(), **payload.model_dump())
    users[user.id] = user
    add_audit(user.id, "user.created", "user", user.id, user.model_dump(mode="json"))
    await manager.broadcast(["dashboard", f"zone:{user.zone}", f"role:{user.role.value}"], {"event": "user.created", "data": user.model_dump(mode="json")})
    return user


@app.get("/users", response_model=list[User])
def list_users() -> list[User]:
    return list(users.values())


@app.post("/alerts", response_model=Incident, status_code=201)
async def create_alert(payload: AlertCreate) -> Incident:
    if payload.reported_by not in users:
        raise HTTPException(status_code=404, detail="reported_by user not found")

    timestamp = now()
    incident = Incident(
        id=str(uuid4()),
        type=payload.type,
        zone=payload.zone,
        severity=payload.severity,
        reported_by=payload.reported_by,
        description=payload.description,
        raw_data=payload.raw_data,
        created_at=timestamp,
        updated_at=timestamp,
        checklist=build_checklist(payload),
        instructions_by_zone=build_zone_instructions(payload),
    )
    incidents[incident.id] = incident
    add_audit(payload.reported_by, "incident.created", "incident", incident.id, incident.model_dump(mode="json"))
    await manager.broadcast(event_channels_for_incident(incident), {"event": "incident.created", "data": incident.model_dump(mode="json")})
    return incident


@app.get("/incidents", response_model=list[Incident])
def list_incidents() -> list[Incident]:
    return sorted(incidents.values(), key=lambda incident: incident.created_at, reverse=True)


@app.get("/incidents/{incident_id}", response_model=Incident)
def get_incident(incident_id: str) -> Incident:
    if incident_id not in incidents:
        raise HTTPException(status_code=404, detail="incident not found")
    return incidents[incident_id]


@app.post("/incidents/{incident_id}/tasks/{task_id}/complete", response_model=Incident)
async def complete_task(incident_id: str, task_id: str, payload: TaskComplete) -> Incident:
    if incident_id not in incidents:
        raise HTTPException(status_code=404, detail="incident not found")
    if payload.user_id not in users:
        raise HTTPException(status_code=404, detail="user not found")

    incident = incidents[incident_id]
    task = next((item for item in incident.checklist if item.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="task not found")
    if task.completed:
        raise HTTPException(status_code=409, detail="task already completed")

    task.completed = True
    task.completed_by = payload.user_id
    task.completed_at = now()
    incident.updated_at = now()

    add_audit(payload.user_id, "task.completed", "task", task_id, {"incident_id": incident_id})
    await manager.broadcast(event_channels_for_incident(incident), {"event": "task.completed", "data": incident.model_dump(mode="json")})
    return incident


@app.post("/incidents/{incident_id}/status", response_model=Incident)
async def update_incident_status(incident_id: str, payload: IncidentStatusUpdate) -> Incident:
    if incident_id not in incidents:
        raise HTTPException(status_code=404, detail="incident not found")
    if payload.actor_id not in users:
        raise HTTPException(status_code=404, detail="actor_id user not found")

    incident = incidents[incident_id]
    incident.status = payload.status
    incident.updated_at = now()

    add_audit(
        payload.actor_id,
        "incident.status_updated",
        "incident",
        incident_id,
        {"status": payload.status.value},
    )
    await manager.broadcast(event_channels_for_incident(incident), {"event": "incident.status_updated", "data": incident.model_dump(mode="json")})
    return incident


@app.post("/status-updates", status_code=202)
async def create_status_update(payload: StatusUpdate) -> dict[str, str]:
    if payload.user_id not in users:
        raise HTTPException(status_code=404, detail="user not found")

    user = users[payload.user_id]
    user.last_seen = now()
    if payload.zone:
        user.zone = payload.zone

    data = payload.model_dump(mode="json")
    add_audit(payload.user_id, "status.reported", "user", payload.user_id, data)
    await manager.broadcast(["dashboard", f"zone:{user.zone}", f"role:{user.role.value}"], {"event": "status.reported", "data": data})
    return {"status": "accepted"}


@app.post("/lone-worker-checkins", response_model=LoneWorkerCheckIn, status_code=201)
async def start_lone_worker_checkin(payload: LoneWorkerCheckInCreate) -> LoneWorkerCheckIn:
    if payload.user_id not in users:
        raise HTTPException(status_code=404, detail="user not found")

    checkin = LoneWorkerCheckIn(id=str(uuid4()), started_at=now(), **payload.model_dump())
    checkins[checkin.id] = checkin
    add_audit(payload.user_id, "checkin.started", "checkin", checkin.id, checkin.model_dump(mode="json"))
    await manager.broadcast(["dashboard", f"role:{users[payload.user_id].role.value}"], {"event": "checkin.started", "data": checkin.model_dump(mode="json")})
    return checkin


@app.post("/lone-worker-checkins/{checkin_id}/return", response_model=LoneWorkerCheckIn)
async def complete_lone_worker_checkin(checkin_id: str) -> LoneWorkerCheckIn:
    if checkin_id not in checkins:
        raise HTTPException(status_code=404, detail="check-in not found")

    checkin = checkins[checkin_id]
    checkin.active = False
    checkin.returned_at = now()
    add_audit(checkin.user_id, "checkin.returned", "checkin", checkin.id, checkin.model_dump(mode="json"))
    await manager.broadcast(["dashboard", f"role:{users[checkin.user_id].role.value}"], {"event": "checkin.returned", "data": checkin.model_dump(mode="json")})
    return checkin


@app.get("/audit-log", response_model=list[AuditEntry])
def get_audit_log() -> list[AuditEntry]:
    return audit_log


@app.get("/audit-log/verify", response_model=AuditVerification)
def verify_audit_log() -> AuditVerification:
    return verify_audit_chain()


@app.get("/authority-feed/{incident_id}")
def get_authority_feed(incident_id: str) -> dict[str, Any]:
    if incident_id not in incidents:
        raise HTTPException(status_code=404, detail="incident not found")
    incident = incidents[incident_id]
    return {
        "incident_id": incident.id,
        "type": incident.type,
        "zone": incident.zone,
        "severity": incident.severity,
        "description": incident.description,
        "raw_data": incident.raw_data,
        "created_at": incident.created_at,
        "latest_status": incident.status,
    }


@app.get("/pr-summary/{incident_id}")
def get_pr_summary(incident_id: str) -> dict[str, Any]:
    if incident_id not in incidents:
        raise HTTPException(status_code=404, detail="incident not found")
    incident = incidents[incident_id]
    incident_audit = [entry for entry in audit_log if entry.entity_id == incident_id or entry.payload.get("incident_id") == incident_id]
    return {
        "incident_id": incident.id,
        "draft": f"{incident.type.value.title()} incident reported in {incident.zone}. Current status: {incident.status.value}.",
        "timeline": incident_audit,
        "roles_involved": sorted({task.role.value for task in incident.checklist}),
        "approval_status": "pending_legal_pr_review",
    }


@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str) -> None:
    await manager.connect(channel, websocket)
    await websocket.send_json({"event": "connected", "channel": channel})
    try:
        while True:
            message = await websocket.receive_json()
            await websocket.send_json({"event": "ack", "data": message})
    except WebSocketDisconnect:
        manager.disconnect(channel, websocket)
