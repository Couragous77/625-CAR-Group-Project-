import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header({ isAuthenticated = false }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <Logo className="logo-car-svg" />
          <span className="brand-name">Budget CAR</span>
        </Link>
        
        <nav className="top-actions" aria-label="Main navigation">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/track-income">Track Income</Link>
              <Link to="/track-expense">Track Expense</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/logout">Logout</Link>
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/signup" className="btn primary">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
