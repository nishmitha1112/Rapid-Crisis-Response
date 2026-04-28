"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import AlertCard from "@/components/AlertCard";
import RoleBoard from "@/components/RoleBoard";
import StatCard from "@/components/StatCard";
import { DashboardAlert } from "@/lib/mock-data";
import { normalizeFirebaseAlerts } from "@/lib/firebase-alerts";
import { db } from "@/lib/firebase";

const MapPanel = dynamic(() => import("@/components/MapPanel"), {
  ssr: false,
});

export default function Home() {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedAlert = useMemo(() => {
    if (alerts.length === 0) {
      return null;
    }

    if (!selectedAlertId) {
      return alerts[0];
    }

    return alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];
  }, [alerts, selectedAlertId]);

  useEffect(() => {
    const alertsRef = ref(db, "alerts");

    const unsubscribe = onValue(
      alertsRef,
      (snapshot) => {
        const nextAlerts = normalizeFirebaseAlerts(snapshot.val());

        setAlerts(nextAlerts);
        setErrorMessage(null);
        setIsLoading(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const activeIncidents = alerts.filter(
    (alert) => alert.status !== "Resolved",
  ).length;
  const respondingCount = alerts.filter(
    (alert) => alert.status === "Responding",
  ).length;
  const resolvedCount = alerts.filter(
    (alert) => alert.status === "Resolved",
  ).length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#eef4ff_45%,#ffffff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-6 text-white shadow-2xl shadow-slate-900/10 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Rapid Response System
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Crisis Command Center Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor incidents, assign responders, and guide the fastest
                route from one unified emergency screen for hotel operations.
              </p>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 font-semibold text-emerald-200">
                {isLoading ? "Connecting to live data..." : "Live feed online"}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                Venue: Orbit Grand Hotel
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                Source: Firebase Realtime Database
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active Incidents"
            value={String(activeIncidents)}
            change="Realtime sync"
            tone="danger"
          />
          <StatCard
            title="Responders En Route"
            value={String(respondingCount)}
            change="Live updates"
            tone="warning"
          />
          <StatCard
            title="Resolved Today"
            value={String(resolvedCount)}
            change="Auto refreshed"
            tone="success"
          />
          <StatCard
            title="Selected Room"
            value={selectedAlert?.room ?? "--"}
            change={selectedAlert?.type ?? "Waiting"}
            tone="neutral"
          />
        </section>

        <section className="mt-6">
          <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-xl shadow-slate-950/5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
                  Alert Feed
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Live alerts
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                  {alerts.length} alerts
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {selectedAlert
                    ? `Selected: ${selectedAlert.type} | Room ${selectedAlert.room} | ${selectedAlert.status}` 
                    : "No alert selected"}
                </span>
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Listening for alert updates...
              </div>
            ) : null}

            {!isLoading && !errorMessage && alerts.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No alerts are available right now.
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  type={alert.type}
                  room={alert.room}
                  status={alert.status}
                  isSelected={selectedAlert?.id === alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                />
              ))}
            </div>
          </section>
        </section>

        {selectedAlert ? (
          <>
            <section className="mt-6">
              <MapPanel
                latitude={selectedAlert.latitude}
                longitude={selectedAlert.longitude}
              />
            </section>

            <section className="mt-6">
              <RoleBoard selectedAlert={selectedAlert} />
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-sm text-slate-500 shadow-md shadow-slate-950/5">
            Select an alert to view the live map and assigned responders.
          </section>
        )}
      </div>
    </main>
  );
}
