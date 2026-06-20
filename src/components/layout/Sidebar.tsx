import { BookOpen, ChartPie, Settings, Sparkles } from "lucide-react";

const navItems = [
  { label: "Reading", icon: BookOpen },
  { label: "Insights", icon: ChartPie },
  { label: "Vocabulary", icon: Sparkles },
  { label: "Settings", icon: Settings }
];

export const Sidebar = () => (
  <aside className="flex h-full flex-col gap-6 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-400">
        Focus Panel
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink-900">Gaze Assist</h1>
    </div>
    <nav className="flex flex-col gap-2">
      {navItems.map((item, index) => (
        <button
          key={item.label}
          type="button"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            index === 0
              ? "bg-ink-800 text-white shadow-insetGlow"
              : "text-ink-600 hover:bg-white/80"
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>
    <div className="mt-auto rounded-xl border border-ink-100 bg-white/80 p-4 text-sm text-ink-600">
      <p className="font-semibold text-ink-800">Gaze calibration</p>
      <p className="mt-1 text-xs">
        Calibrate once before your first reading session. Recalibrate anytime if tracking feels off.
      </p>
    </div>
  </aside>
);
