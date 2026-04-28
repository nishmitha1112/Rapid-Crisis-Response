import heapq
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the nodes (x, y) coordinates for the floorplan
NODES = {
    "floor1_start": {"x": 30, "y": 55},
    "floor2_start": {"x": 70, "y": 30},
    "lobby_start": {"x": 50, "y": 50},
    "junction_north": {"x": 30, "y": 30},
    "junction_south": {"x": 30, "y": 80},
    "junction_east": {"x": 70, "y": 60},
    "junction_west": {"x": 15, "y": 50},
    "junction_center": {"x": 50, "y": 40},
    "Exit A": {"x": 15, "y": 85},
    "Emergency Stairs": {"x": 82, "y": 18},
    "Exit B": {"x": 92, "y": 65},
    "Fire Exit": {"x": 45, "y": 12},
    "Main Gate": {"x": 50, "y": 92},
    "Side Exit": {"x": 5, "y": 40},
    "service_path": {"x": 80, "y": 80},
    "utility_hall": {"x": 10, "y": 20},
}

# Define edges between nodes (bidirectional)
# Each edge has a distance (base weight)
EDGES = [
    ("floor1_start", "junction_north", 25),
    ("floor1_start", "junction_south", 25),
    ("floor2_start", "junction_east", 15),
    ("floor2_start", "junction_center", 25),
    ("lobby_start", "junction_center", 10),
    ("lobby_start", "junction_east", 25),
    ("junction_north", "Fire Exit", 20),
    ("junction_north", "junction_center", 20),
    ("junction_south", "Exit A", 15),
    ("junction_south", "junction_west", 20),
    ("junction_west", "Side Exit", 10),
    ("junction_west", "junction_north", 20),
    ("junction_east", "Exit B", 25),
    ("junction_east", "Emergency Stairs", 40),
    ("junction_center", "Main Gate", 50),
    ("junction_center", "Fire Exit", 25),
    ("floor2_start", "service_path", 100),
    ("service_path", "Main Gate", 20),
    ("floor1_start", "utility_hall", 60),
    ("utility_hall", "Fire Exit", 10),
]

def calculate_confidence(sos, sensor, crowd):
    score = 0
    
    if sos:
        score += 50
    if sensor:
        score += 30
    if crowd:
        score += 20

    if sos and sensor:
        score += 10

    if crowd and not sos:
        score -= 10

    score = min(score, 100)

    if score >= 80:
        status = "CRITICAL"
    elif score >= 50:
        status = "MODERATE"
    else:
        status = "LOW"

    return score, status


def assign_roles(users, status):
    roles = {}
    
    for user in users:
        if status == "CRITICAL" and user["type"] == "staff":
            roles[user["id"]] = "Emergency Commander"
        elif user["type"] == "staff":
            roles[user["id"]] = "Support Staff"
        else:
            roles[user["id"]] = "Evacuate Immediately"
    
    return roles


def dijkstra(start_node, exits, exit_statuses, crowd_density, preference="fastest"):
    """
    Dijkstra's algorithm to find the best route.
    preference: "fastest" (prioritize short distance) vs "safest" (prioritize avoiding high density/danger)
    """
    queue = [(0, start_node, [])]
    visited = set()
    
    # Pre-process edge weights based on preference
    # crowd_density: list of node IDs where crowds are detected
    # exit_statuses: dict of {exit_name: status} "SAFE" | "RESTRICTED" | "DANGER"
    
    while queue:
        (cost, current_node, path) = heapq.heappop(queue)
        
        if current_node in visited:
            continue
            
        visited.add(current_node)
        path = path + [current_node]
        
        if current_node in exits:
            # Check if exit is usable
            status = exit_statuses.get(current_node, "SAFE")
            if status == "DANGER":
                continue # Blocked
            
            # If safest preference, restricted exits are very expensive
            if preference == "safest" and status == "RESTRICTED":
                cost += 1000
                
            return path, cost

        for node1, node2, dist in EDGES:
            next_node = None
            if node1 == current_node:
                next_node = node2
            elif node2 == current_node:
                next_node = node1
                
            if next_node and next_node not in visited:
                edge_cost = dist
                
                # Penalty for crowds
                if crowd_density and (next_node in crowd_density or current_node in crowd_density):
                    if preference == "safest":
                        edge_cost += 500 # High penalty for crowd in safe mode
                    else:
                        edge_cost += 50  # Moderate penalty in fast mode
                
                # Penalty for proximity to incident start (implicit in graph connections)
                # But here we can add explicit risk analysis
                
                heapq.heappush(queue, (cost + edge_cost, next_node, path))
                
    return None, float('inf')

def get_dynamic_route(location, status, crowd, preference="fastest", exit_override=None):
    # Mapping location to start node
    start_nodes = {
        "floor1": "floor1_start",
        "floor2": "floor2_start",
        "lobby": "lobby_start"
    }
    start_node = start_nodes.get(location, "lobby_start")
    
    exits = ["Exit A", "Emergency Stairs", "Exit B", "Fire Exit", "Main Gate", "Side Exit"]
    
    # Simulate exit statuses based on status
    exit_statuses = {
        "Exit A": "SAFE",
        "Emergency Stairs": "RESTRICTED" if status == "CRITICAL" else "SAFE",
        "Exit B": "SAFE",
        "Fire Exit": "SAFE",
        "Main Gate": "SAFE",
        "Side Exit": "RESTRICTED" if status == "CRITICAL" else "SAFE"
    }
    
    # If user manually blocked an exit (for simulation purposes)
    if exit_override:
        exit_statuses.update(exit_override)

    # Convert crowd boolean to list of nodes (simulated)
    crowd_nodes = []
    if crowd:
        # Simulate high density in logical bottlenecks and main arteries
        crowd_nodes = ["junction_center", "Main Gate", "junction_east", "junction_north"]

    path, cost = dijkstra(start_node, exits, exit_statuses, crowd_nodes, preference)
    
    if not path:
        # Fallback if everything is blocked
        return "Nearest Exit", [], exit_statuses
        
    final_exit = path[-1]
    path_coords = [NODES[node] for node in path]
    
    return final_exit, path_coords, exit_statuses

def generate_checklist(status, location):
    if status == "CRITICAL":
        return [
            f"Alert emergency services for {location}",
            "Activate fire suppression system",
            "Guide guests to nearest exits",
            "Staff coordinate evacuation",
            "Check all rooms"
        ]
    elif status == "MODERATE":
        return [
            "Investigate source",
            "Prepare evacuation",
            "Notify staff"
        ]
    else:
        return [
            "Monitor situation"
        ]


def zone_instructions(location, status):
    if status == "CRITICAL":
        return {
            location: "EVACUATE IMMEDIATELY via nearest exit",
            "adjacent_zones": "Prepare to evacuate",
            "safe_zones": "Stay calm and wait for instructions"
        }
    elif status == "MODERATE":
        return {
            location: "Standby and prepare",
            "adjacent_zones": "Be alert",
            "safe_zones": "No action required"
        }
    else:
        return {
            location: "Normal operations",
            "all_zones": "No threat detected"
        }


def generate_log(data, score, status, roles, route):
    return {
        "event": "Emergency Triggered",
        "timestamp": datetime.now().isoformat(),
        "input": {
            "sos": data.get("sos"),
            "sensor": data.get("sensor"),
            "crowd": data.get("crowd"),
            "location": data.get("location")
        },
        "decision": {
            "confidence": score,
            "status": status,
            "route": route
        },
        "roles_assigned": roles
    }


def generate_timeline(log):
    return [
        f"{log['timestamp']} → Event triggered",
        f"Status determined as {log['decision']['status']}",
        f"Evacuation route assigned: {log['decision']['route']}",
        "Roles assigned to staff and guests",
        "Checklist generated and executed"
    ]


def prioritize_tasks(checklist):
    priority_map = {
        "Alert emergency services": 1,
        "Activate fire suppression system": 2,
        "Guide guests to nearest exits": 3,
        "Staff coordinate evacuation": 4,
        "Check all rooms": 5
    }

    return sorted(
        checklist,
        key=lambda task: next((priority_map[k] for k in priority_map if k in task), 99)
    )


def detect_risk_type(sos, sensor, crowd):
    if sensor and sos:
        return "Fire Hazard"
    elif crowd and not sensor:
        return "Crowd Panic"
    elif sensor:
        return "Technical Alert"
    else:
        return "Unknown"


def crowd_severity(crowd):
    return "High Density Crowd" if crowd else "Normal"


def estimate_response_time(status):
    if status == "CRITICAL":
        return "Immediate (0-2 min)"
    elif status == "MODERATE":
        return "5-10 min"
    else:
        return "Monitor"


def explain_score(sos, sensor, crowd):
    explanation = []
    if sos:
        explanation.append("SOS signal detected")
    if sensor:
        explanation.append("Sensor triggered")
    if crowd:
        explanation.append("Crowd detected")
    return explanation

event_history = {}

def escalation_engine(location, status):
    if location not in event_history:
        event_history[location] = 1
    else:
        event_history[location] += 1

    if event_history[location] >= 3 and status != "CRITICAL":
        return "CRITICAL"
    
    return status

def sensor_data():
    return {
        "temperature": 75,
        "smoke_level": 60,
        "gas_level": 20
    }

def generate_report(status, location, roles):
    return {
        "summary": f"{status} incident at {location}",
        "actions_taken": list(roles.values()),
        "recommended_followup": "Detailed inspection required" if status == "CRITICAL" else "Monitor situation"
    }

def location_map(location):
    mapping = {
        "floor1": {"unit": "Floor 1", "zone": "North Wing", "risk_level": "High"},
        "floor2": {"unit": "Floor 2", "zone": "East Wing", "risk_level": "Medium"},
        "lobby": {"unit": "Lobby", "zone": "Central", "risk_level": "Low"}
    }
    return mapping.get(location, {"unit": "Unknown", "zone": "Unknown", "risk_level": "Unknown"})

def ai_detection(sensor):
    if sensor:
        return "Smoke detected via AI vision system"
    return "No hazard detected"

def situational_awareness(score, crowd, sensor):
    level = "Stable"

    if score > 80:
        level = "Severe"
    elif score > 50:
        level = "Elevated"

    if crowd and sensor:
        level += " with active hazard"

    return level

def predict_next_state(status):
    if status == "CRITICAL":
        return "High risk of escalation or spread"
    elif status == "MODERATE":
        return "May escalate if not controlled"
    else:
        return "Stable, low risk"

def allocate_resources(status):
    if status == "CRITICAL":
        return ["Fire Team", "Medical Team", "Security Team"]
    elif status == "MODERATE":
        return ["Security Team", "Maintenance Team"]
    else:
        return ["Monitoring Staff"]

def decision_confidence(score):
    if score > 80:
        return "High Confidence"
    elif score > 50:
        return "Medium Confidence"
    else:
        return "Low Confidence"

def coordination_plan(roles):
    return {
        "command": [k for k, v in roles.items() if "Commander" in v],
        "support": [k for k, v in roles.items() if "Support" in v],
        "evacuation": [k for k, v in roles.items() if "Evacuate" in v]
    }

def decision_justification(score, sos, sensor, crowd):
    reasons = []

    if sos:
        reasons.append("SOS triggered")
    if sensor:
        reasons.append("Sensor detected anomaly")
    if crowd:
        reasons.append("Crowd density increased")

    reasons.append(f"Final score: {score}")

    return reasons

learning_db = []

def adaptive_learning(log):
    learning_db.append(log)
    return f"System has learned from {len(learning_db)} past incidents"

def anomaly_detection(sos, sensor, crowd):
    if sensor and not crowd and not sos:
        return "Possible hidden hazard detected"
    if crowd and not sensor:
        return "Unusual crowd movement detected"
    return "No anomaly"

def acknowledgment(users):
    return {user["id"]: "Pending Acknowledgment" for user in users}

def communication_channels(status):
    if status == "CRITICAL":
        return ["SMS", "Mobile App", "Email", "Alarm System"]
    elif status == "MODERATE":
        return ["Mobile App", "Email"]
    else:
        return ["System Log"]

def crisis_stage(status):
    if status == "CRITICAL":
        return "Response Phase"
    elif status == "MODERATE":
        return "Preparedness Phase"
    else:
        return "Monitoring Phase"

def stakeholders(status):
    if status == "CRITICAL":
        return ["Emergency Services", "Hotel Management", "Guests"]
    elif status == "MODERATE":
        return ["Hotel Staff", "Security Team"]
    else:
        return ["Monitoring Team"]

def message_priority(status):
    if status == "CRITICAL":
        return "HIGH PRIORITY"
    elif status == "MODERATE":
        return "MEDIUM PRIORITY"
    else:
        return "LOW PRIORITY"

def resolve_conflicts(status, route, zone):
    if status == "CRITICAL":
        return f"Follow evacuation route: {route} (overrides all)"
    return "Follow zone instructions"

def time_to_impact(status):
    if status == "CRITICAL":
        return "Immediate danger (0-2 min)"
    elif status == "MODERATE":
        return "Escalation possible in 5-10 min"
    else:
        return "Low risk"

def reliability(score, sensor):
    if score > 80 and sensor:
        return "Highly Reliable"
    elif score > 50:
        return "Moderately Reliable"
    return "Low Reliability"

def context_alerts(users, status, location):
    alerts = {}
    
    for user in users:
        if user["type"] == "staff":
            alerts[user["id"]] = f"{status} alert at {location} - coordinate response"
        else:
            alerts[user["id"]] = f"{status} alert - follow evacuation instructions"
    
    return alerts

def proximity_alerts(users, status, location, risk_type):
    alerts = []
    for user in users:
        distance = user.get("distance")
        if distance is None:
            distance = 999

        # Assuming we want to alert for "Fire Hazard" or similar emergencies within 5m
        if distance <= 5 and ("Fire" in risk_type or status == "CRITICAL"):
            alerts.append(f"URGENT: {risk_type} detected at {location} within 5m! Evacuate immediately!")
    return alerts

def auto_actions(status):
    if status == "CRITICAL":
        return [
            "Alert emergency services",
            "Activate alarms",
            "Unlock emergency exits"
        ]
    elif status == "MODERATE":
        return [
            "Notify security",
            "Prepare evacuation"
        ]
    return ["Monitoring only"]

def shared_awareness(status, location, roles):
    return {
        "incident": f"{status} at {location}",
        "active_teams": list(set(roles.values())),
        "coordination_required": True if status == "CRITICAL" else False
    }

def governance_rules(status, sensor):
    if sensor and status == "CRITICAL":
        return "Automated decisions approved"
    return "Human verification required"

def human_override(status):
    if status == "CRITICAL":
        return "Manual override available for commander"
    return "System operating autonomously"

def system_health():
    return {
        "status": "Operational",
        "last_updated": "Real-time",
        "failure_risk": "Low"
    }

def ethical_check(status):
    if status == "CRITICAL":
        return "Prioritize human safety over property"
    return "Maintain safety balance"

def integrations(status):
    if status == "CRITICAL":
        return ["Fire System", "Police", "Medical Services"]
    return ["Internal Monitoring"]

def resilience_mode(network=True):
    if not network:
        return "Offline mode: Local coordination active"
    return "Online mode"

def kpi_metrics(log):
    return {
        "response_time_sec": 30,  # simulated
        "time_to_decision_sec": 5,
        "sla_met": True if log["decision"]["status"] == "CRITICAL" else True
    }

def after_action(status):
    if status == "CRITICAL":
        return [
            "Conduct safety drill review",
            "Inspect fire systems",
            "Update SOP if delays observed"
        ]
    elif status == "MODERATE":
        return ["Review alert accuracy", "Check sensors"]
    return ["No action required"]

def vulnerable_support(users):
    support = []
    for u in users:
        if u.get("vulnerable"):
            support.append(f"Assist user {u['id']} with priority evacuation")
    return support

import uuid

def generate_incident_id():
    return str(uuid.uuid4())

def incident_playback(log, timeline):
    return {
        "incident_id": log.get("event") + "_" + log.get("timestamp"),
        "steps": timeline,
        "final_status": log["decision"]["status"]
    }

def risk_action_map(status, roles, tasks):
    return {
        "risk": status,
        "actions": tasks,
        "teams": list(set(roles.values()))
    }

def action_sequence(tasks):
    return [{"step": i+1, "task": t} for i, t in enumerate(tasks)]

@app.get("/")
def home():
    return {"message": "Intelligence Layer Running"}

@app.post("/request-assistance")
def request_assistance(data: dict):
    type_map = {
        "medical": "First Responder - Medical",
        "fire": "Fire Response Unit",
        "security": "Site Security",
        "other": "Response Coordinator"
    }
    
    responder = type_map.get(data.get("type"), "Emergency Responder")
    
    return {
        "id": f"REQ-{datetime.now().strftime('%M%S')}",
        "type": data.get("type"),
        "status": "received",
        "timestamp": datetime.now().isoformat(),
        "location": data.get("location", "Unknown Location"),
        "chat_log": [
            {
                "sender": "responder",
                "message": f"Hello, this is {responder}. We have received your request and a unit is being dispatched to {data.get('location')}. Please stay where you are if safe.",
                "time": "Just now"
            }
        ]
    }

import traceback

@app.post("/process")
def process_event(data: dict):
    try:
        score, status = calculate_confidence(
            data.get("sos"),
            data.get("sensor"),
            data.get("crowd")
        )
    
        location = data.get("location")
        status = escalation_engine(location, status)

        users = data.get("users") or []
        roles = assign_roles(users, status)
    
        # New Dynamic Routing
        preference = data.get("routing_preference", "fastest")
        exit_override = data.get("exit_override")
        route, path_coords, exit_statuses = get_dynamic_route(
            location, status, data.get("crowd"), preference, exit_override
        )

        tasks = generate_checklist(status, location)
        priority_tasks = prioritize_tasks(tasks)

        log = generate_log(data, score, status, roles, route)
        timeline = generate_timeline(log)

        risk_type = detect_risk_type(data.get("sos"), data.get("sensor"), data.get("crowd"))
        prox_alerts = proximity_alerts(users, status, location, risk_type)

        group_tracking = {
            "group_id": "GRP-7721",
            "invite_code": "RQ-SAFE-99",
            "members": [
                {
                    "id": " SarahL",
                    "name": "Sarah Lawson",
                    "relation": "Spouse",
                    "location": "North Atrium",
                    "status": "evacuating",
                    "last_seen": "2 mins ago",
                    "avatar": "https://i.pravatar.cc/150?u=sarah"
                },
                {
                    "id": "LeoL",
                    "name": "Leo Lawson",
                    "relation": "Son",
                    "location": "Floor 1 - Utility Path",
                    "status": "safe",
                    "last_seen": "Just now",
                    "avatar": "https://i.pravatar.cc/150?u=leo"
                }
            ]
        }

        return {
            "confidence": score,
            "status": status,
            "roles": roles,
            "route": route,
            "path_coords": path_coords,
            "exit_ways": exit_statuses,
            "alert": f"{status} emergency detected at {location}",
            "checklist": tasks,
            "priority_tasks": priority_tasks,
            "zone_actions": zone_instructions(location, status),
            "risk_type": risk_type,
            "proximity_alerts": prox_alerts,
            "crowd_status": crowd_severity(data.get("crowd")),
            "group_tracking": group_tracking,
            "response_time": estimate_response_time(status),
            "explanation": explain_score(data.get("sos"), data.get("sensor"), data.get("crowd")),
            "log": log,
            "sensor_data": sensor_data(),
            "report": generate_report(status, location, roles),
            "timeline": timeline,
            "situation": situational_awareness(score, data.get("crowd"), data.get("sensor")),
            "prediction": predict_next_state(status),
            "resources": allocate_resources(status),
            "decision_confidence": decision_confidence(score),
            "coordination": coordination_plan(roles),
            "justification": decision_justification(score, data.get("sos"), data.get("sensor"), data.get("crowd")),
            "learning_status": adaptive_learning(log),
            "anomaly": anomaly_detection(data.get("sos"), data.get("sensor"), data.get("crowd")),
            "acknowledgment": acknowledgment(users),
            "channels": communication_channels(status),
            "crisis_stage": crisis_stage(status),
            "stakeholders": stakeholders(status),
            "priority_level": message_priority(status),
            "final_decision": resolve_conflicts(status, route, zone_instructions(location, status)),
            "time_to_impact": time_to_impact(status),
            "context_alerts": context_alerts(users, status, location),
            "reliability": reliability(score, data.get("sensor")),
            "auto_actions": auto_actions(status),
            "shared_awareness": shared_awareness(status, location, roles),
            "kpis": kpi_metrics(log),
            "after_action": after_action(status),
            "special_support": vulnerable_support(users),
            "incident_id": generate_incident_id(),
            "playback": incident_playback(log, timeline),
            "risk_action_map": risk_action_map(status, roles, tasks),
            "action_sequence": action_sequence(tasks),
            "spatial_info": location_map(location),
            "blockchain_log": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "event_type": "INITIAL_ALERT",
                    "details": f"Emergency signal detected at {location}.",
                    "prev_hash": "0x000000000000",
                    "hash": "0x1a2b3c4d5e6f"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "event_type": "AI_ANALYSIS",
                    "details": f"Confidence score {score}% calculated. Risk type: {risk_type}.",
                    "prev_hash": "0x1a2b3c4d5e6f",
                    "hash": "0x9f8e7d6c5b4a"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "event_type": "RESOURCE_DISPATCH",
                    "details": f"Units dispatched: {', '.join(allocate_resources(status))}.",
                    "prev_hash": "0x9f8e7d6c5b4a",
                    "hash": "0x4k3j2i1h0g9f"
                },
                {
                    "timestamp": datetime.now().isoformat(),
                    "event_type": "PROTOCOL_ACTUALIZED",
                    "details": f"Emergency protocols for {status} status initiated properly.",
                    "prev_hash": "0x4k3j2i1h0g9f",
                    "hash": "0xab12cd34ef56"
                }
            ],
            "lone_worker_alerts": [],
            "pr_narrative": {
                "headline": "Incident Handled Promptly",
                "body": "A minor incident was detected and handled.",
                "approval_status": "PENDING_LEGAL",
                "timeline_summary": ["Event triggered"]
            },
            "resilience": {
                "mode": "CLOUD_SYNC",
                "status": "Healthy",
                "peer_count": 0
            },
            "active_sop": {
                "version": "1.0",
                "last_updated": datetime.now().isoformat(),
                "steps": [
                    {
                        "id": "1",
                        "task": "Acknowledge Alert",
                        "mandatory": True,
                        "completed": False
                    }
                ]
            },
            "raw_stream": {
                "smoke_ppm": [0, 5, 2, 8, 1],
                "thermal_gradient": "Normal",
                "camera_feed": "Live",
                "external_bridge": "Connected"
            },
            "digital_twin": {
                "map_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000",
                "hotspots": [
                    {
                        "id": "lobby",
                        "label": "Lobby Area",
                        "coords": {"x": 50, "y": 50},
                        "status": "DANGER" if status == "CRITICAL" else "SAFE"
                    }
                ]
            },
            "guest_features": {
                "localized_sensors": {
                    "temp": "24°C" if status != "CRITICAL" else "38°C",
                    "air_quality": "NORMAL" if status != "CRITICAL" else "SMOKE_DETECTED",
                    "visibility": "CLEAR" if status != "CRITICAL" else "LOW"
                },
                "safety_checklist": [
                    {"id": 1, "task": "Secure all personal belongings", "priority": "LOW"},
                    {"id": 2, "task": "Follow the cyan floor markers", "priority": "CRITICAL"},
                    {"id": 3, "task": "Avoid using elevators", "priority": "CRITICAL"},
                    {"id": 4, "task": "Stay updated via this dashboard", "priority": "MODERATE"}
                ],
                "emergency_contacts": [
                    {"role": "Security", "phone": "+1 (555) 911-RESCUE"},
                    {"role": "Medical Staff", "phone": "+1 (555) SOS-LUXE"},
                    {"role": "Fire Marshal", "phone": "EXT 9000"}
                ]
            },
            "command_center": {
                "staff": [
                    {"id": "S1", "name": "John Doe", "role": "Security Lead", "status": "busy", "sub_status": "Evacuating Zone A", "location": "North Atrium", "coords": {"x": 25, "y": 30}},
                    {"id": "S2", "name": "Sarah Smith", "role": "Medical Staff", "status": "available", "location": "Emergency Room", "coords": {"x": 75, "y": 20}},
                    {"id": "S3", "name": "Mike Ross", "role": "Fire Marshal", "status": "in_danger", "sub_status": "Handling Smoke", "location": "Exit B", "coords": {"x": 90, "y": 60}},
                    {"id": "S4", "name": "Harvey Specter", "role": "Tactical Lead", "status": "available", "location": "Main Lobby", "coords": {"x": 50, "y": 50}}
                ],
                "zones": [
                    {"id": "Z1", "name": "North Atrium", "status": "risk" if status == "CRITICAL" else "safe", "staff_assigned": ["S1"], "guests_count": 45, "evacuation_progress": 65},
                    {"id": "Z2", "name": "Main Lobby", "status": "safe", "staff_assigned": ["S4"], "guests_count": 12, "evacuation_progress": 90},
                    {"id": "Z3", "name": "Exit B Corridor", "status": "critical" if status == "CRITICAL" else "safe", "staff_assigned": ["S3"], "guests_count": 8, "evacuation_progress": 20}
                ],
                "fire_spread": {
                    "origin": location,
                    "affected_zones": ["North Atrium", "Exit B Corridor"] if status == "CRITICAL" else [],
                    "rate": "2.5m/min" if status == "CRITICAL" else "0m/min"
                },
                "evacuation_stats": {
                    "total_guests": 150,
                    "evacuated_count": 112,
                    "remaining_count": 38,
                    "progress_percentage": 74
                },
                "active_risks": [
                    {"type": "SMOKE", "location": "Exit B", "severity": "high"},
                    {"type": "BLOCKAGE", "location": "Stairwell 2", "severity": "medium"}
                ] if status == "CRITICAL" else [],
                "iot_controls": {
                    "fire_suppression": False,
                    "door_locks": {"Exit A": "unlocked", "Exit B": "locked", "Main Gate": "unlocked"},
                    "elevators": "override",
                    "ventilation": "smoke_extraction" if status == "CRITICAL" else "normal"
                },
                "operational_tasks": [
                    {"id": "T1", "owner": "John Doe", "task": "Evacuate North Atrium", "status": "in_progress", "due_time": "21:45", "overdue": False},
                    {"id": "T2", "owner": "Sarah Smith", "task": "Setup Triage in Lobby", "status": "pending", "due_time": "21:40", "overdue": True},
                    {"id": "T3", "owner": "Mike Ross", "task": "Check Fire Exit B", "status": "done", "due_time": "21:30", "overdue": False}
                ],
                "ai_suggestions": [
                    "Redirect guests from Exit B to Emergency Stairs due to smoke density.",
                    "Activate Fire Suppression in North Atrium immediately.",
                    "Dispatch backup to S3 at Exit B."
                ] if status == "CRITICAL" else ["Maintain situational awareness."],
                "timeline_log": [
                    {"time": "21:30", "event": "Initial Alert Triggered", "type": "auto"},
                    {"time": "21:32", "event": "Staff Dispatched to Zone A", "type": "manual"},
                    {"time": "21:35", "event": "Exit B Blockage Detected", "type": "auto"}
                ],
                "resources": [
                    {"id": "R1", "type": "Fire Extinguisher", "status": "in_use", "location": "Zone A"},
                    {"id": "R2", "type": "Medical Kit", "status": "available", "location": "Lobby"},
                    {"id": "R3", "type": "Oxygen Tank", "status": "depleted", "location": "Exit B"}
                ]
            },
            "global_admin": {
                "sites": [
                    {"id": "SITE_A", "name": "Grand Hotel Royale", "status": "CRITICAL" if status == "CRITICAL" else "SAFE", "location": {"lat": 40.7128, "lng": -74.0060}, "active_incidents": 1 if status == "CRITICAL" else 0},
                    {"id": "SITE_B", "name": "Luxe Mall & Plaza", "status": "SAFE", "location": {"lat": 40.7306, "lng": -73.9352}, "active_incidents": 0},
                    {"id": "SITE_C", "name": "Tech Innovation Campus", "status": "WARNING", "location": {"lat": 40.7580, "lng": -73.9855}, "active_incidents": 0}
                ],
                "active_site_id": "SITE_A",
                "recommendations": [
                    {"id": "R1", "type": "EVACUATION", "title": "Priority Evacuation Floor 3", "description": "Smoke detected near Exit B. Immediate rerouting required.", "impact": "Safety: +40% | Time: -2min", "confidence": 98, "action_label": "Evacuate Now"},
                    {"id": "R2", "type": "SYSTEM", "title": "Engage HVAC Extraction", "description": "High smoke density in North Atrium. Activate high-power ventilation.", "impact": "Visibility: +25%", "confidence": 85, "action_label": "Activate Extraction"},
                    {"id": "R3", "type": "SECURITY", "title": "Lockdown Service Level 1", "description": "Prevent unauthorized access to utility corridors.", "impact": "Containment: +15%", "confidence": 92, "action_label": "Lockdown Area"}
                ] if status == "CRITICAL" else [],
                "system_health": {
                    "sensors": {"online": 452, "offline": 3, "faulty": 1},
                    "network": {"status": "OPTIMAL", "latency": "12ms"},
                    "cameras": {"active": 124, "total": 128}
                },
                "predictive_sim": {
                    "time_horizon": "5 minutes",
                    "fire_prediction": "Likely to breach South Corridor in T-120s.",
                    "evac_outcome": "95% success rate if Exit A remains clear.",
                    "bottleneck_prediction": "Stairwell 2 congestion likely in T-180s."
                },
                "compliance": {
                    "osha_alignment": 94,
                    "nfpa_status": "COMPLIANT",
                    "audit_log_hash": "0x7f8e9d..."
                },
                "escalation_level": 3 if status == "CRITICAL" else 1,
                "autonomous_mode": "ASSISTED"
            },
            "responder_data": {
                "next_best_action": {
                    "task": "Proceed to Floor 2 via Stairwell B",
                    "target": "Zone A (North Atrium)",
                    "distance": "15m",
                    "eta": "45s",
                    "hazard_warning": "High Smoke Density in 10m"
                },
                "navigation": [
                    {"instruction": "Forward 5m to junction", "distance": "5m"},
                    {"instruction": "Turn Left at Fire Exit A", "distance": "2m", "hazard": "Blocked by debris"},
                    {"instruction": "Enter Stairwell B", "distance": "8m"}
                ],
                "biometrics": {
                    "heart_rate": 115 if status == "CRITICAL" else 75,
                    "stress_level": "ELEVATED" if status == "CRITICAL" else "NORMAL",
                    "oxygen_level": 82 if status == "CRITICAL" else 100,
                    "exposure_time": "12m" if status == "CRITICAL" else "0m"
                },
                "nearby_teams": [
                    {"id": "R2", "name": "John Doe", "role": "Medic", "distance": "12m"},
                    {"id": "R3", "name": "Sarah Smith", "role": "Fire", "distance": "25m"}
                ],
                "nearby_equipment": [
                    {"id": "E1", "type": "Fire Extinguisher", "status": "AVAILABLE", "location": "Hallway 2", "distance": "8m"},
                    {"id": "E2", "type": "Medical Kit", "status": "AVAILABLE", "location": "Lobby", "distance": "20m"}
                ],
                "hazard_predictions": [
                    {"type": "FLASHOVER", "timer": "90s", "action": "Ventilate Immediately"},
                    {"type": "COLLAPSE", "timer": "4m", "action": "Evacuate Ceiling Area"}
                ] if status == "CRITICAL" else [],
                "micro_sop": [
                    "Check door temperature",
                    "Open slowly, stay low",
                    "Communicate status to base"
                ],
                "mission_status": {
                    "objective": "Evacuate Floor 2 South Wing",
                    "progress": 70
                }
            }
        }
    except Exception as e:
        print("ERROR IN PROCESS_EVENT:")
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "detail": traceback.format_exc()}
        )

@app.get("/global-intelligence")
def get_global_intelligence():
    return {
        "summary": {
            "total_incidents": 142,
            "critical_hubs": 12,
            "active_responders": 4850,
            "global_status": "ELE-2 (Elevated Risk)"
        },
        "incidents": [
            {"id": "NYC-22", "location": "New York, USA", "type": "Structural", "status": "DANGER", "severity": "CRITICAL", "impact": "High Density Area", "eta": "12m"},
            {"id": "LON-45", "location": "London, UK", "type": "Flood", "status": "WARNING", "severity": "HIGH", "impact": "Transport Network", "eta": "24m"},
            {"id": "TOK-89", "location": "Tokyo, Japan", "type": "Seismic", "status": "STABLE", "severity": "LOW", "impact": "Industrial Zone", "eta": "Resolved"},
            {"id": "SYD-12", "location": "Sydney, Australia", "type": "Wildfire", "status": "DANGER", "severity": "CRITICAL", "impact": "Suburban Fringe", "eta": "4m"},
            {"id": "DUB-33", "location": "Dubai, UAE", "type": "Storm", "status": "WARNING", "severity": "MODERATE", "impact": "Aviation Hub", "eta": "Ongoing"},
            {"id": "PAR-09", "location": "Paris, France", "type": "Grid Failure", "status": "WARNING", "severity": "HIGH", "impact": "Central District", "eta": "18m"},
            {"id": "RIO-77", "location": "Rio, Brazil", "type": "Landslide", "status": "DANGER", "severity": "CRITICAL", "impact": "Favelas Sector 4", "eta": "6m"},
            {"id": "DEL-101", "location": "Delhi, India", "type": "Air Quality", "status": "WARNING", "severity": "MODERATE", "impact": "City-wide", "eta": "Seasonal"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
