import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  // true when the user just arrived from the sign-up page
  const [justRegistered, setJustRegistered] = useState(location.state?.registered === true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Two-factor: after the password is right, the server may ask for a 6-digit code
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState('');

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const newErrors = {};

    if (email.trim() === '') {
      newErrors.email = 'Please enter your email.';
    }

    if (password === '') {
      newErrors.password = 'Please enter your password.';
    }

    // Only check the code once the code box is showing
    if (needsCode && code.length !== 6) {
      newErrors.code = 'Enter the 6-digit code from your app.';
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setJustRegistered(false); // hide the green message

    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Only include the code when the code box is showing
      const body = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      if (needsCode) {
        body.code = code;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.twoFactorRequired) {
        // Password was right, but this account needs a code. Show the code box.
        setNeedsCode(true);
        setCode('');
      } else if (response.ok) {
        // Success: the server saved the login in a cookie. Go to the dashboard.
        navigate('/dashboard');
      } else if (response.status === 401) {
        // 401 means the password is wrong, or (on the code step) the code is wrong
        if (needsCode) {
          setMessage(data.message || 'That code is not correct. Try again.');
          setCode('');
        } else {
          setMessage('Your email and password do not match.');
        }
      } else {
        setMessage(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setMessage('Cannot connect to the server. Is the backend running?');
    }

    setLoading(false);
  }

  // The "Back" link under the code box
  function goBack() {
    setNeedsCode(false);
    setCode('');
    setPassword('');
    setMessage('');
    setErrors({});
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-slate-900">
          {needsCode ? 'Two-factor authentication' : 'Welcome back'}
        </h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          {needsCode
            ? 'Open your authenticator app and enter the 6-digit code.'
            : 'Sign in to your account.'}
        </p>

        {/* Green message after a successful sign-up */}
        {justRegistered && message === '' && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Account created! Please sign in.
          </div>
        )}

        {/* Red message for errors */}
        {message !== '' && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: email and password */}
          {!needsCode && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={inputClass}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
            </>
          )}

          {/* STEP 2: the 6-digit code (only after the server asks for it) */}
          {needsCode && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoComplete="one-time-code"
                autoFocus
                placeholder="123456"
                className={inputClass}
              />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Please wait...' : needsCode ? 'Verify' : 'Sign in'}
          </button>

          {needsCode && (
            <button
              type="button"
              onClick={goBack}
              className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Back to sign in
            </button>
          )}
        </form>

        {!needsCode && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}