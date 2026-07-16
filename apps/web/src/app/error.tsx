'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;

  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">页面暂时不可用</h1>
        <button className="mt-4 underline" onClick={reset} type="button">
          重试
        </button>
      </div>
    </main>
  );
}
