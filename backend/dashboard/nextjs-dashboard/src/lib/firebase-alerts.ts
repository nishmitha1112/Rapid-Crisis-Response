import { DashboardAlert, IncidentStatus, IncidentType } from "./mock-data";

type FirebaseAlertValue = {
  id?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  room?: unknown;
  status?: unknown;
  type?: unknown;
};

const validTypes = new Set<IncidentType>(["Fire", "Medical", "Security"]);
const validStatuses = new Set<IncidentStatus>([
  "Alerted",
  "Responding",
  "Resolved",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toAlert = (id: string, value: FirebaseAlertValue): DashboardAlert | null => {
  if (
    typeof value.room !== "string" ||
    typeof value.latitude !== "number" ||
    typeof value.longitude !== "number" ||
    typeof value.type !== "string" ||
    typeof value.status !== "string"
  ) {
    return null;
  }

  if (!validTypes.has(value.type as IncidentType)) {
    return null;
  }

  if (!validStatuses.has(value.status as IncidentStatus)) {
    return null;
  }

  return {
    id,
    type: value.type as IncidentType,
    room: value.room,
    status: value.status as IncidentStatus,
    latitude: value.latitude,
    longitude: value.longitude,
  };
};

export const normalizeFirebaseAlerts = (value: unknown): DashboardAlert[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (!isRecord(item)) {
          return null;
        }

        const alertId =
          typeof item.id === "string" && item.id.length > 0
            ? item.id
            : `alert-${index}`;

        return toAlert(alertId, item);
      })
      .filter((alert): alert is DashboardAlert => alert !== null);
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .map(([id, item]) => {
      if (!isRecord(item)) {
        return null;
      }

      return toAlert(id, item);
    })
    .filter((alert): alert is DashboardAlert => alert !== null);
};
