import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white px-6 text-center">
      <div className="border border-gray-200 px-10 py-14">
        <p className="eyebrow text-primary">Error 404</p>
        <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-[0.06em] text-gray-900 sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-gray-600">The page you are looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-8 inline-block bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#e07610]"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
