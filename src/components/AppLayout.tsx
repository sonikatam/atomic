import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,122,26,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(125,227,255,0.12),transparent_34%),linear-gradient(180deg,#090A12_0%,#101017_48%,#07070B_100%)]" />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-6 md:pb-12">
        <Outlet />
      </main>
    </div>
  );
}
