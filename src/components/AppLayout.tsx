import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] text-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-6 md:pb-12">
        <Outlet />
      </main>
    </div>
  );
}
