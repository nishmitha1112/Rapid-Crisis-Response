"use client";

import React from "react";
import { divIcon, LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);

type MapPanelProps = {
  latitude: number;
  longitude: number;
};

export default function MapPanel({ latitude, longitude }: MapPanelProps) {
  const selectedLocation: LatLngExpression = [latitude, longitude];
  const incidentIcon = divIcon({
    className: "",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #ef4444;
        border: 3px solid white;
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.22);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <section className="w-full rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200/80">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
          Incident Map
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Live location view
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          OpenStreetMap tiles with a live incident marker that follows the
          currently selected alert.
        </p>
      </div>

      <div className="h-[400px] w-full overflow-hidden rounded-3xl">
        <MapContainer
          key={`${latitude}-${longitude}`}
          center={selectedLocation}
          className="h-full w-full"
          scrollWheelZoom={true}
          zoom={15}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker icon={incidentIcon} position={selectedLocation}>
            <Popup>Incident location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
}
