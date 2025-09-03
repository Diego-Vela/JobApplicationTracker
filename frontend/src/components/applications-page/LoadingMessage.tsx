export default function LoadingMessage({ text }: { text: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 text-center text-gray-600">
      {text}
    </div>
  );
}