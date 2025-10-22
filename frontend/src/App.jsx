import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Dashboard from './pages/Dashboard';
// import TrackExpense from './pages/TrackExpense';
// import TrackIncome from './pages/TrackIncome';
// import Profile from './pages/Profile';
import './styles/common.css';

export default function App() {
  // TODO: Add authentication state management (e.g., Context API, Redux, or Zustand)
  const isAuthenticated = false; // Replace with actual auth state

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        
        {/* Protected Routes - Uncomment as you build them */}
        {/* <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/track-expense" 
          element={isAuthenticated ? <TrackExpense /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/track-income" 
          element={isAuthenticated ? <TrackIncome /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        /> */}

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
