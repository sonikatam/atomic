import { Flame, Home, PlusCircle, Trophy, User, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/challenges', label: 'Groups', icon: UsersRound },
  { to: '/self', label: 'Self', icon: Trophy },
  { to: '/create', label: 'Create', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-ink/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/dashboard" className="flex items-center gap-3 font-black tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ember to-coral shadow-glow">
              <Flame className="h-5 w-5" />
            </span>
            1% Club
          </NavLink>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white', isActive && 'bg-white/10 text-white')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <nav className="fixed bottom-4 left-4 right-4 z-40 grid grid-cols-5 rounded-3xl border border-white/10 bg-zinc-950/90 p-2 shadow-2xl backdrop-blur-xl md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-white/50', isActive && 'bg-white/10 text-white')
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
