import React from "react";
import { DashboardAlert, ResponderRole } from "@/lib/mock-data";

type Responder = {
  role: ResponderRole;
  name: string;
  note: string;
};

type RoleBoardProps = {
  selectedAlert: DashboardAlert;
};

const roleIcons: Record<ResponderRole, string> = {
  Security: "👮",
  Manager: "👩‍💼",
  Medical: "⚕️",
};

const respondersByAlertType: Record<DashboardAlert["type"], Responder[]> = {
  Fire: [
    {
      role: "Security",
      name: "Officer Ryan Carter",
      note: "Securing perimeter access",
    },
    {
      role: "Manager",
      name: "Riya Sharma",
      note: "Coordinating evacuation flow",
    },
    {
      role: "Medical",
      name: "Dr. Neha Reddy",
      note: "Standing by for smoke exposure",
    },
  ],
  Medical: [
    {
      role: "Security",
      name: "Officer Ryan Carter",
      note: "Clearing response path",
    },
    {
      role: "Manager",
      name: "Riya Sharma",
      note: "Managing guest communication",
    },
    {
      role: "Medical",
      name: "Nurse Elena Morris",
      note: "Primary on-site treatment lead",
    },
  ],
  Security: [
    {
      role: "Security",
      name: "Officer Maya Singh",
      note: "Handling incident containment",
    },
    {
      role: "Manager",
      name: "Riya Sharma",
      note: "Escalating to operations control",
    },
    {
      role: "Medical",
      name: "Nurse Elena Morris",
      note: "On standby if support is needed",
    },
  ],
};

export default function RoleBoard({ selectedAlert }: RoleBoardProps) {
  const responders = respondersByAlertType[selectedAlert.type];

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-950/5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
          Assigned Responders
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Role board
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Responders assigned to the selected {selectedAlert.type.toLowerCase()}{" "}
          incident in Room {selectedAlert.room}.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {responders.map((responder) => (
          <article
            key={responder.role}
            className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
              <span aria-hidden="true">{roleIcons[responder.role]}</span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {responder.role}
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                {responder.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{responder.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
