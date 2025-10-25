import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-center">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Page Not Found</h2>
          <p className="not-found-text">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          <div className="not-found-actions">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="btn primary">
              {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
            </Link>
            
            {isAuthenticated && (
              <div className="not-found-links">
                <Link to="/track-expense">Track Expense</Link>
                <Link to="/track-income">Track Income</Link>
                <Link to="/profile">Profile</Link>
              </div>
            )}
          </div>

          <div className="not-found-help">
            <p>Need help? Check out our <Link to="/help">Help Center</Link> or contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
