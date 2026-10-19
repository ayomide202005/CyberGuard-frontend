import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import formatTime from '../utils/formatTime.js';

// "Good morning", "Good afternoon" or "Good evening"
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// The labels for the four security bars, in the order we show them
const barLabels = [
  { key: 'password', label: 'Password Security' },
  { key: 'account', label: 'Account Security' },
  { key: 'device', label: 'Device Security' },
  { key: 'privacy', label: 'Privacy' },
];

// Colours for the score card, picked by the label from the backend
const scoreStyles = {
  Good: 'bg-green-50 text-green-700',
  Fair: 'bg-amber-50 text-amber-700',
  'At risk': 'bg-red-50 text-red-700',
};

// Colour of a bar depends on its value
function getBarColor(value) {
  if (value >= 80) return 'bg-green-500';
  if (value >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null); // the dashboard data from the backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Runs once, when the page opens: ask the backend for the dashboard data
  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch('/api/dashboard');

        // 401 means "not signed in", so go to the sign-in page
        if (response.status === 401) {
          navigate('/signin');
          return;
        }

        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          setError(result.message || 'Something went wrong.');
        }
      } catch (err) {
        setError('Cannot connect to the server. Is the backend running?');
      }

      setLoading(false);
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  const firstName = data.user.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* ---------- Greeting ---------- */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is a look at your digital security today.
          </p>
        </div>

        {/* ---------- Score + stat cards ---------- */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm md:col-span-1">
            <p className="text-xs font-semibold tracking-wide text-slate-500">SECURITY SCORE</p>
            <p className="mt-2 text-5xl font-bold text-slate-900">
              {data.score.value}
              <span className="text-xl text-slate-400">/100</span>
            </p>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                scoreStyles[data.score.label]
              }`}
            >
              {data.score.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 md:col-span-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Devices</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data.stats.devices}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Alerts</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data.stats.alerts}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Activities</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data.stats.activities}</p>
            </div>
          </div>
        </div>

        {/* ---------- Security overview bars ---------- */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Security Overview</h2>
          <div className="space-y-4">
            {barLabels.map((item) => {
              const value = data.breakdown[item.key];
              return (
                <div key={item.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-medium text-slate-900">{value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${getBarColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- Recent activity ---------- */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h2>

          {data.recentActivity.length === 0 && (
            <p className="text-sm text-slate-500">No activity yet.</p>
          )}

          <ul className="divide-y divide-slate-100">
            {data.recentActivity.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-700">
                  <span
                    className={item.status === 'warning' ? 'text-amber-500' : 'text-green-600'}
                  >
                    {item.status === 'warning' ? '⚠' : '✓'}
                  </span>{' '}
                  {item.description}
                </span>
                <span className="text-slate-400">{formatTime(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Recommendations ---------- */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Security Recommendations</h2>
          <ul className="space-y-3">
            {data.recommendations.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                <span className={item.status === 'warning' ? 'text-amber-500' : 'text-green-600'}>
                  {item.status === 'warning' ? '⚠' : '✓'}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}