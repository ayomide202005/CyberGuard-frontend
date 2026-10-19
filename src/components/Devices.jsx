import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import formatTime from '../utils/formatTime.js';

export default function Devices() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the devices when the page opens
  useEffect(() => {
    async function loadDevices() {
      try {
        const response = await fetch('/api/devices');

        if (response.status === 401) {
          navigate('/signin');
          return;
        }

        const result = await response.json();

        if (response.ok) {
          setDevices(result.devices);
        } else {
          setError(result.message || 'Something went wrong.');
        }
      } catch (err) {
        setError('Cannot connect to the server. Is the backend running?');
      }

      setLoading(false);
    }

    loadDevices();
  }, [navigate]);

  // "Mark as trusted" button
  async function handleTrust(id) {
    setError('');

    try {
      const response = await fetch(`/api/devices/${id}/trust`, { method: 'PATCH' });

      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      if (response.ok) {
        // Update this device in our list without reloading the page
        setDevices(
          devices.map((device) => (device.id === id ? { ...device, isTrusted: true } : device))
        );
      } else {
        const result = await response.json();
        setError(result.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is the backend running?');
    }
  }

  // "Remove" button
  async function handleRemove(id) {
    // Ask first, because this cannot be undone
    if (!window.confirm('Remove this device from your account?')) {
      return;
    }

    setError('');

    try {
      const response = await fetch(`/api/devices/${id}`, { method: 'DELETE' });

      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      if (response.ok) {
        // Take the device out of our list
        setDevices(devices.filter((device) => device.id !== id));
      } else {
        const result = await response.json();
        setError(result.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is the backend running?');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Devices</h1>
          <p className="mt-1 text-sm text-slate-500">
            These are the devices that have signed in to your account. Remove any you do not
            recognise.
          </p>
        </div>

        {error !== '' && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading && <p className="text-slate-500">Loading devices...</p>}

        {!loading && devices.length === 0 && error === '' && (
          <p className="text-sm text-slate-500">No devices yet.</p>
        )}

        <ul className="space-y-3">
          {devices.map((device) => (
            <li
              key={device.id}
              className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{device.name}</p>

                  {device.isCurrent && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      This device
                    </span>
                  )}

                  {device.isTrusted ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Trusted
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Not trusted
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  IP: {device.ipAddress || 'Unknown'} · Last active {formatTime(device.lastActiveAt)}
                </p>
              </div>

              <div className="flex gap-2">
                {!device.isTrusted && (
                  <button
                    onClick={() => handleTrust(device.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Mark as trusted
                  </button>
                )}

                {/* We hide "Remove" for the device you are using right now */}
                {!device.isCurrent && (
                  <button
                    onClick={() => handleRemove(device.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
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