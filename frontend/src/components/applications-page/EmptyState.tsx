/* EmptyState.tsx
  Displays a message when there are no applications in a specific state
*/
import { Link } from "react-router-dom";

export default function EmptyState({ showCta, label }: { showCta?: boolean; label: string }) {
  return (
    <div className="rounded-lg border bg-white p-8 text-center">
      <p className="mb-3 text-gray-700">No {label.toLowerCase()} applications.</p>
      {showCta && (
        <Link
          to="/applications/new"
          className="inline-block rounded-lg bg-brand px-4 py-2 text-white hover:brightness-95"
        >
          Add your first application
        </Link>
      )}
    </div>
  );
}
