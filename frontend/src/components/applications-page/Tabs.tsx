/* Tabs.tsx
  Displays the different tabs on the UI for filtering job applications
*/
import { TABS } from "../statusMaps";
import type { TabKey } from "../types";

export default function Tabs({
  value,
  onChange,
}: { value: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav className="mb-6 overflow-x-auto">
      <ul className="flex gap-2">
        {TABS.map((t) => {
          const active = value === t.key;
          return (
            <li key={t.key}>
              <button
                onClick={() => onChange(t.key)}
                className={[
                  "whitespace-nowrap rounded-full px-4 py-2 text-xl hover:cursor-pointer",
                  active ? "bg-brand text-white hover:bg-brand" : "border text-gray-700 hover:bg-gray-100 ",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
