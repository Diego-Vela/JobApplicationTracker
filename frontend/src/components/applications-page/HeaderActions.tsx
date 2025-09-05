// components/applications-page/HeaderActions.tsx
import { Link } from "react-router-dom";
import { RefreshCw} from "lucide-react"; // <-- Add icons

type Props = {
  onRefresh: () => void;
};

export default function HeaderActions({ onRefresh }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        className="rounded-lg border px-3 py-2 text-xl hover:bg-gray-100 flex items-center gap-2"
      >
        <RefreshCw className="h-5 w-5" aria-hidden /> {/* Refresh icon */}
        Refresh
      </button>
      <Link
        to="/applications/new"
        className="rounded-lg bg-brand px-4 py-2 text-xl font-medium text-white hover:brightness-95 flex items-center gap-2"
      >
        + Add Application
      </Link>
    </div>
  );
}
