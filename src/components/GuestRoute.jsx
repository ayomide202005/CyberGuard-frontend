import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// Wrap a page in this to keep signed-in users out of it (sign in, sign up)
export default function GuestRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  // Runs once: ask the backend if the user is already signed in
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me');
        setSignedIn(response.ok); // true if the login cookie is valid
      } catch (err) {
        setSignedIn(false);
      }
      setChecking(false);
    }

    checkSession();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // Already signed in: go to the dashboard instead
  if (signedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not signed in: show the page
  return children;
}