// components/applications-page/HeaderActions.tsx
import { Link } from "react-router-dom";

type Props = {
  onRefresh: () => void;
};

export default function HeaderActions({ onRefresh }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
      >
        Refresh
      </button>
      <Link
        to="/applications/new"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:brightness-95"
      >
        + Add Application
      </Link>
    </div>
  );
}
