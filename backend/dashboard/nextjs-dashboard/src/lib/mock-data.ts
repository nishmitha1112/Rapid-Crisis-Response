export type IncidentStatus = "Alerted" | "Responding" | "Resolved";
export type IncidentType = "Medical" | "Fire" | "Security";
export type Severity = "Critical" | "High" | "Moderate";
export type RoleStatus = "Assigned" | "En route" | "On site";
export type ResponderRole = "Security" | "Manager" | "Medical";

export type Incident = {
  id: string;
  type: IncidentType;
  location: string;
  floor: string;
  guest: string;
  reportedAt: string;
  severity: Severity;
  status: IncidentStatus;
  responder: string;
  eta: string;
};

export type RoleAssignment = {
  role: string;
  name: string;
  zone: string;
  status: RoleStatus;
  eta: string;
};

export type DashboardAlert = {
  id: string;
  type: IncidentType;
  room: string;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
};

export type RouteStop = {
  label: string;
  title: string;
  subtitle: string;
  top: string;
  left: string;
};

export const incidents: Incident[] = [
  {
    id: "INC-204",
    type: "Medical",
    location: "Room 305",
    floor: "Tower A - Floor 3",
    guest: "Aarav Patel",
    reportedAt: "10:32 AM",
    severity: "Critical",
    status: "Responding",
    responder: "Nurse Elena",
    eta: "3 min",
  },
  {
    id: "INC-205",
    type: "Security",
    location: "Lobby Gate 2",
    floor: "Ground Floor",
    guest: "Visitor Checkpoint",
    reportedAt: "10:36 AM",
    severity: "High",
    status: "Alerted",
    responder: "Officer Ryan",
    eta: "5 min",
  },
  {
    id: "INC-199",
    type: "Fire",
    location: "Kitchen Block",
    floor: "Service Wing",
    guest: "Back Office Staff",
    reportedAt: "09:58 AM",
    severity: "Moderate",
    status: "Resolved",
    responder: "Fire Marshal Team",
    eta: "Closed",
  },
];

export const roleAssignments: RoleAssignment[] = [
  {
    role: "Security Lead",
    name: "Officer Ryan Carter",
    zone: "Lobby Gate 2",
    status: "Assigned",
    eta: "5 min",
  },
  {
    role: "Medical Response",
    name: "Nurse Elena Morris",
    zone: "Room 305",
    status: "En route",
    eta: "3 min",
  },
  {
    role: "Duty Manager",
    name: "Riya Sharma",
    zone: "Tower A",
    status: "On site",
    eta: "Arrived",
  },
];

export const routeStops: RouteStop[] = [
  {
    label: "A",
    title: "Responder Start",
    subtitle: "Security desk",
    top: "74%",
    left: "14%",
  },
  {
    label: "B",
    title: "Checkpoint",
    subtitle: "Lift access",
    top: "44%",
    left: "42%",
  },
  {
    label: "C",
    title: "Incident Zone",
    subtitle: "Room 305",
    top: "24%",
    left: "76%",
  },
];
