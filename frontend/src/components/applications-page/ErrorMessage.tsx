// components/applications-page/ErrorMessage.tsx
export default function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 text-center text-red-600">
      {text}
    </div>
  );
}