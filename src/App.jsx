import { Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/Signup.jsx';
import SignIn from './components/Signin.jsx';
import Dashboard from './components/Dashboard.jsx';
import Devices from './components/Devices.jsx';
import Alerts from './components/Alerts.jsx';
import Settings from './components/Settings.jsx';
import GuestRoute from './components/GuestRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />

      {/* Only for people who are NOT signed in */}
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignUp />
          </GuestRoute>
        }
      />
      <Route
        path="/signin"
        element={
          <GuestRoute>
            <SignIn />
          </GuestRoute>
        }
      />

      {/* These pages check for a login themselves */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}