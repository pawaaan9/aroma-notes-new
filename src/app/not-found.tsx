import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-center animate-fade-in-up">
      <div>
        <h1 className="text-5xl font-smooch font-bold text-gray-900">Page not found</h1>
        <p className="mt-4 text-gray-600 font-poppins">The page you are looking for doesn&apos;t exist.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-white font-poppins hover:opacity-90 transition">Go home</Link>
      </div>
    </main>
  );
}


