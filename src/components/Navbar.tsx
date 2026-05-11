import { Circle, Home, PlusCircle, Trophy, User, UsersRound } from 'lucide-react';
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
      <header className="sticky top-0 z-30 hidden border-b border-zinc-200 bg-white/85 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Circle className="h-3.5 w-3.5 fill-zinc-900 text-zinc-900" />
            </span>
            atomic
          </NavLink>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950', isActive && 'bg-zinc-100 text-zinc-950')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <nav className="fixed bottom-4 left-4 right-4 z-40 grid grid-cols-5 rounded-xl border border-zinc-200 bg-white/95 p-1.5 shadow-sm md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium text-zinc-500', isActive && 'bg-zinc-100 text-zinc-950')
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
