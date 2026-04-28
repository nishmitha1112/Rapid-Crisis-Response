import React from "react";

type AlertCardProps = {
  type: "Fire" | "Medical" | "Security";
  room: string;
  status: "Alerted" | "Responding" | "Resolved";
  isSelected?: boolean;
  onClick?: () => void;
};

const typeEmoji: Record<AlertCardProps["type"], string> = {
  Fire: "🔥",
  Medical: "🚑",
  Security: "🔐",
};

const statusStyles: Record<AlertCardProps["status"], string> = {
  Alerted: "bg-red-100 text-red-700 ring-red-200",
  Responding: "bg-amber-100 text-amber-700 ring-amber-200",
  Resolved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

export default function AlertCard({
  type,
  room,
  status,
  isSelected = false,
  onClick,
}: AlertCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-2xl p-0 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
        isSelected ? "scale-[1.01]" : ""
      }`}
    >
      <article
        className={`rounded-2xl p-5 shadow-md ring-1 transition ${
          isSelected
            ? "bg-sky-50 shadow-sky-100 ring-sky-400"
            : "bg-white ring-slate-200/80 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Emergency Type</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              <span className="mr-2" aria-hidden="true">
                {typeEmoji[type]}
              </span>
              {type}
            </h3>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-500">Room</p>
          <p className="mt-1 text-base font-semibold text-slate-800">{room}</p>
        </div>
      </article>
    </button>
  );
}
