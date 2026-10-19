import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import formatTime from '../utils/formatTime.js';

// Badge colours for each severity (full class names so Tailwind can find them)
const severityStyles = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

export default function Alerts() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the alerts when the page opens
  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await fetch('/api/alerts');

        if (response.status === 401) {
          navigate('/signin');
          return;
        }

        const result = await response.json();

        if (response.ok) {
          setAlerts(result.alerts);
        } else {
          setError(result.message || 'Something went wrong.');
        }
      } catch (err) {
        setError('Cannot connect to the server. Is the backend running?');
      }

      setLoading(false);
    }

    loadAlerts();
  }, [navigate]);

  // "Mark as resolved" button
  async function handleResolve(id) {
    setError('');

    try {
      const response = await fetch(`/api/alerts/${id}/resolve`, { method: 'PATCH' });

      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      if (response.ok) {
        // Update this alert in our list without reloading the page
        setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, isResolved: true } : alert)));
      } else {
        const result = await response.json();
        setError(result.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is the backend running?');
    }
  }

  const openCount = alerts.filter((alert) => !alert.isResolved).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
          <p className="mt-1 text-sm text-slate-500">
            {openCount === 0
              ? 'You have no open alerts.'
              : `You have ${openCount} open alert${openCount > 1 ? 's' : ''}.`}
          </p>
        </div>

        {error !== '' && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading && <p className="text-slate-500">Loading alerts...</p>}

        {!loading && alerts.length === 0 && error === '' && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-slate-900">All clear ✓</p>
            <p className="mt-1 text-sm text-slate-500">
              We will let you know here if anything needs your attention.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-xl bg-white p-5 shadow-sm ${alert.isResolved ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{alert.title}</p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        severityStyles[alert.severity]
                      }`}
                    >
                      {alert.severity}
                    </span>

                    {alert.isResolved && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Resolved
                      </span>
                    )}
                  </div>

                  {alert.message && <p className="mt-1 text-sm text-slate-600">{alert.message}</p>}
                  <p className="mt-1 text-xs text-slate-400">{formatTime(alert.createdAt)}</p>
                </div>

                {!alert.isResolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Mark as resolved
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}