import { Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">E-Commerce</h1>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
