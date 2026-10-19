import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Settings() {
  const navigate = useNavigate();

  // ---------- Change password state ----------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); // true = red message, false = green message
  const [loading, setLoading] = useState(false);

  // ---------- Two-factor state ----------
  // null = still loading, true = on, false = off
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(null);
  // When setting up, this holds { qrCode, secret }. Otherwise it is null.
  const [setupData, setSetupData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');

  const [tfMessage, setTfMessage] = useState('');
  const [tfIsError, setTfIsError] = useState(false);
  const [tfLoading, setTfLoading] = useState(false);

  // When the page opens, ask the backend if two-factor is on
  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch('/api/auth/me');

        if (response.status === 401) {
          navigate('/signin');
          return;
        }

        const data = await response.json();
        setTwoFactorEnabled(data.user.twoFactorEnabled);
      } catch (err) {
        setTfIsError(true);
        setTfMessage('Cannot connect to the server. Is the backend running?');
      }
    }

    loadStatus();
  }, [navigate]);

  // ---------- Change password ----------
  function validateForm() {
    const newErrors = {};

    if (currentPassword === '') {
      newErrors.currentPassword = 'Please enter your current password.';
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters.';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from your current password.';
    }

    if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      // 401 means the user is not signed in any more
      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswords(false);
      } else {
        setIsError(true);
        setMessage(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setIsError(true);
      setMessage('Cannot connect to the server. Is the backend running?');
    }

    setLoading(false);
  }

  // ---------- Two-factor functions ----------

  // Button "Turn on": ask the backend for a QR code
  async function startSetup() {
    setTfMessage('');
    setTfLoading(true);

    try {
      const response = await fetch('/api/2fa/setup', { method: 'POST' });

      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSetupData({ qrCode: data.qrCode, secret: data.secret });
        setTwoFactorCode('');
      } else {
        setTfIsError(true);
        setTfMessage(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setTfIsError(true);
      setTfMessage('Cannot connect to the server. Is the backend running?');
    }

    setTfLoading(false);
  }

  // Button "Confirm": send the 6-digit code to the backend
  async function confirmSetup(event) {
    event.preventDefault();
    setTfMessage('');

    if (twoFactorCode.length !== 6) {
      setTfIsError(true);
      setTfMessage('Enter the 6-digit code from your app.');
      return;
    }

    setTfLoading(true);

    try {
      const response = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setTwoFactorEnabled(true);
        setSetupData(null);
        setTwoFactorCode('');
        setTfIsError(false);
        setTfMessage('Two-factor authentication is now on.');
      } else {
        setTfIsError(true);
        setTfMessage(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setTfIsError(true);
      setTfMessage('Cannot connect to the server. Is the backend running?');
    }

    setTfLoading(false);
  }

  // Button "Cancel" during setup: just hide the QR code
  function cancelSetup() {
    setSetupData(null);
    setTwoFactorCode('');
    setTfMessage('');
  }

  // Button "Turn off": send the password to the backend
  async function turnOff(event) {
    event.preventDefault();
    setTfMessage('');

    if (disablePassword === '') {
      setTfIsError(true);
      setTfMessage('Enter your password to turn off two-factor authentication.');
      return;
    }

    setTfLoading(true);

    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      if (response.status === 401) {
        navigate('/signin');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setTwoFactorEnabled(false);
        setDisablePassword('');
        setTfIsError(false);
        setTfMessage('Two-factor authentication is now off.');
      } else {
        setTfIsError(true);
        setTfMessage(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setTfIsError(true);
      setTfMessage('Cannot connect to the server. Is the backend running?');
    }

    setTfLoading(false);
  }

  // Inputs share the same look, so we keep it in one place
  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  // "text" shows the password, "password" hides it
  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account security.</p>
        </div>

        {/* The two cards sit side by side on wide screens, stacked on phones */}
        <div className="flex flex-col items-start gap-6 md:flex-row">
          {/* ---------- Change password ---------- */}
          <section className="w-full rounded-xl bg-white p-6 shadow-sm md:flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">
              Use at least 8 characters, and a password you do not use anywhere else.
            </p>

            {message !== '' && (
              <div
                className={
                  isError
                    ? 'mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700'
                    : 'mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700'
                }
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-slate-700">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type={inputType}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className={inputClass}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
                  New password
                </label>
                <input
                  id="newPassword"
                  type={inputType}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={inputClass}
                />
                {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type={inputType}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Show passwords
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Change password'}
              </button>
            </form>
          </section>

          {/* ---------- Two-factor authentication ---------- */}
          <section className="w-full rounded-xl bg-white p-6 shadow-sm md:flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Two-factor authentication</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">
              Add a second step when you sign in. You will need a 6-digit code from an
              authenticator app on your phone.
            </p>

            {tfMessage !== '' && (
              <div
                className={
                  tfIsError
                    ? 'mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700'
                    : 'mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700'
                }
              >
                {tfMessage}
              </div>
            )}

            {/* Still loading the status */}
            {twoFactorEnabled === null && <p className="text-sm text-slate-500">Loading...</p>}

            {/* STATE 1: it is off, and we are not setting it up */}
            {twoFactorEnabled === false && setupData === null && (
              <div>
                <p className="mb-4 text-sm text-slate-600">
                  Status: <span className="font-semibold text-amber-600">Off</span>
                </p>
                <button
                  type="button"
                  onClick={startSetup}
                  disabled={tfLoading}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {tfLoading ? 'Please wait...' : 'Turn on two-factor authentication'}
                </button>
              </div>
            )}

            {/* STATE 2: setting up (QR code is showing) */}
            {twoFactorEnabled === false && setupData !== null && (
              <form onSubmit={confirmSetup} className="space-y-4">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">1.</span> Open an authenticator app (Google
                  Authenticator, Microsoft Authenticator or Authy) and scan this QR code.
                </p>

                <img
                  src={setupData.qrCode}
                  alt="Scan this QR code with your authenticator app"
                  className="mx-auto h-48 w-48"
                />

                <p className="text-xs text-slate-500">
                  Cannot scan? Type this key into your app instead:
                </p>
                <p className="break-all rounded-lg bg-slate-100 p-2 text-center font-mono text-sm text-slate-800">
                  {setupData.secret}
                </p>

                <div>
                  <label htmlFor="twoFactorCode" className="mb-1 block text-sm font-medium text-slate-700">
                    <span className="font-semibold">2.</span> Enter the 6-digit code from the app
                  </label>
                  <input
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={tfLoading}
                    className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {tfLoading ? 'Checking...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelSetup}
                    className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* STATE 3: it is on */}
            {twoFactorEnabled === true && (
              <form onSubmit={turnOff} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Status: <span className="font-semibold text-green-600">On</span>
                </p>

                <div>
                  <label htmlFor="disablePassword" className="mb-1 block text-sm font-medium text-slate-700">
                    To turn it off, enter your password
                  </label>
                  <input
                    id="disablePassword"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    autoComplete="current-password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={tfLoading}
                  className="w-full rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {tfLoading ? 'Please wait...' : 'Turn off two-factor authentication'}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}