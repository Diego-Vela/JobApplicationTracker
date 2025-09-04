/* EmptyState.tsx
  Displays a message when there are no applications in a specific state
*/

export default function EmptyState({}: { showCta?: boolean; label: string }) {
  return (
    <div className="rounded-lg border bg-white p-8 text-center">
      <p className="mb-3 text-gray-700 text-lg">No applications found.</p>
    </div>
  );
}
