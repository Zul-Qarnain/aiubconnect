import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-2xl mt-4">Page Not Found</p>
        <p className="mt-2">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md">Go Home</Link>
      </div>
    </div>
  );
}