import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/devices', label: 'Devices' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const navigate = useNavigate();

  // Is the mobile menu open? It starts closed.
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // even if this fails, we still send the user to the sign-in page
    }
    setMenuOpen(false);
    navigate('/signin');
  }

  // Link look on desktop and tablet: a pill, solid indigo when it is the current page
  function desktopLinkClass({ isActive }) {
    return `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  }

  // Link look in the mobile menu: big, easy to tap
  function mobileLinkClass({ isActive }) {
    return `block rounded-lg px-4 py-3 text-base font-medium transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-700 hover:bg-slate-100'
    }`;
  }

  return (
    // sticky + top-0 keeps the bar at the top while the page scrolls
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* ----- Logo ----- */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">CyberGuard</span>
        </Link>

        {/* ----- Links: only on tablets and bigger ----- */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ----- Sign out: only on tablets and bigger ----- */}
        <button
          type="button"
          onClick={handleSignOut}
          className="hidden rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 md:block"
        >
          Sign out
        </button>

        {/* ----- Menu button: only on phones ----- */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* ----- Mobile menu panel (only shows when open, and only on phones) ----- */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={mobileLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 w-full rounded-lg bg-slate-900 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}