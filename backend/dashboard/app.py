from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import os
from datetime import datetime, timedelta
import random

app = FastAPI(title="Emergency Management Dashboard", version="2.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Templates
templates = Jinja2Templates(directory="templates")

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Data Models
class EmergencyEvent(BaseModel):
    id: str
    timestamp: str
    type: str
    severity: str
    location: str
    status: str
    confidence: int
    description: str

class SystemMetrics(BaseModel):
    total_events: int
    active_events: int
    resolved_events: int
    avg_response_time: float
    system_uptime: float
    accuracy_rate: float

class ResourceStatus(BaseModel):
    name: str
    type: str
    status: str
    location: str
    last_updated: str

# In-memory storage (in production, use database)
events_db: List[EmergencyEvent] = []
metrics_db: List[SystemMetrics] = []
resources_db: List[ResourceStatus] = []

# Initialize with sample data
def initialize_sample_data():
    # Sample events
    sample_events = [
        EmergencyEvent(
            id="evt_001",
            timestamp=datetime.now().isoformat(),
            type="Fire Hazard",
            severity="CRITICAL",
            location="Floor 2 - Room 204",
            status="Active",
            confidence=95,
            description="Smoke detected with high temperature readings"
        ),
        EmergencyEvent(
            id="evt_002",
            timestamp=(datetime.now() - timedelta(hours=2)).isoformat(),
            type="Medical Emergency",
            severity="MODERATE",
            location="Lobby - Reception",
            status="Resolved",
            confidence=78,
            description="Guest reported medical condition"
        ),
        EmergencyEvent(
            id="evt_003",
            timestamp=(datetime.now() - timedelta(hours=4)).isoformat(),
            type="Security Alert",
            severity="LOW",
            location="Parking Level B",
            status="Monitoring",
            confidence=65,
            description="Unusual activity detected in parking area"
        )
    ]
    
    # Sample resources
    sample_resources = [
        ResourceStatus(
            name="Fire Team Alpha",
            type="Emergency Response",
            status="Deployed",
            location="Floor 2",
            last_updated=datetime.now().isoformat()
        ),
        ResourceStatus(
            name="Medical Team",
            type="Medical Support",
            status="On Standby",
            location="Lobby",
            last_updated=datetime.now().isoformat()
        ),
        ResourceStatus(
            name="Security Team",
            type="Security",
            status="Active",
            location="All Floors",
            last_updated=datetime.now().isoformat()
        )
    ]
    
    events_db.extend(sample_events)
    resources_db.extend(sample_resources)

# Initialize data
initialize_sample_data()

# API Routes
@app.get("/", response_class=HTMLResponse)
async def dashboard():
    return templates.TemplateResponse("dashboard.html", {"request": {}})

@app.get("/api/events", response_model=List[EmergencyEvent])
async def get_events():
    return events_db

@app.get("/api/events/{event_id}", response_model=EmergencyEvent)
async def get_event(event_id: str):
    event = next((e for e in events_db if e.id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.post("/api/events", response_model=EmergencyEvent)
async def create_event(event: EmergencyEvent):
    event.id = f"evt_{len(events_db) + 1:03d}"
    event.timestamp = datetime.now().isoformat()
    events_db.append(event)
    return event

@app.put("/api/events/{event_id}", response_model=EmergencyEvent)
async def update_event(event_id: str, event: EmergencyEvent):
    index = next((i for i, e in enumerate(events_db) if e.id == event_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Event not found")
    events_db[index] = event
    return event

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str):
    index = next((i for i, e in enumerate(events_db) if e.id == event_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Event not found")
    events_db.pop(index)
    return {"message": "Event deleted successfully"}

@app.get("/api/metrics", response_model=SystemMetrics)
async def get_metrics():
    total_events = len(events_db)
    active_events = len([e for e in events_db if e.status == "Active"])
    resolved_events = len([e for e in events_db if e.status == "Resolved"])
    avg_response_time = random.uniform(2.5, 8.5)  # Simulated
    system_uptime = 99.8  # Simulated
    accuracy_rate = random.uniform(85, 98)  # Simulated
    
    return SystemMetrics(
        total_events=total_events,
        active_events=active_events,
        resolved_events=resolved_events,
        avg_response_time=avg_response_time,
        system_uptime=system_uptime,
        accuracy_rate=accuracy_rate
    )

@app.get("/api/resources", response_model=List[ResourceStatus])
async def get_resources():
    return resources_db

@app.get("/api/analytics")
async def get_analytics():
    # Event type distribution
    event_types = {}
    for event in events_db:
        event_types[event.type] = event_types.get(event.type, 0) + 1
    
    # Severity distribution
    severity_dist = {"CRITICAL": 0, "MODERATE": 0, "LOW": 0}
    for event in events_db:
        severity_dist[event.severity] += 1
    
    # Location distribution
    location_dist = {}
    for event in events_db:
        location_dist[event.location] = location_dist.get(event.location, 0) + 1
    
    # Response time trends (simulated)
    response_trends = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        response_trends.append({
            "date": date,
            "avg_response_time": random.uniform(2.5, 8.5),
            "events_count": random.randint(1, 10)
        })
    
    return {
        "event_types": event_types,
        "severity_distribution": severity_dist,
        "location_distribution": location_dist,
        "response_trends": response_trends,
        "confidence_trends": [e.confidence for e in events_db]
    }

@app.get("/api/system/health")
async def system_health():
    return {
        "status": "Operational",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "Healthy",
            "database": "Healthy",
            "ai_engine": "Healthy",
            "notification_system": "Healthy"
        },
        "performance": {
            "cpu_usage": random.uniform(20, 60),
            "memory_usage": random.uniform(30, 70),
            "disk_usage": random.uniform(10, 40)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
