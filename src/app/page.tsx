export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <a
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-6 py-3 text-base font-medium shadow transition-colors duration-200 ease-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        dashboard
      </a>
    </div>
  );
}
