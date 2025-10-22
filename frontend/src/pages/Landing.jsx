import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/common.css';

export default function Landing() {
  return (
    <div style={{ 
      display: 'grid', 
      placeItems: 'center', 
      minHeight: '100vh',
      padding: '1.25rem'
    }}>
      <div className="auth-shell">
        {/* Left promo / value prop */}
        <section className="promo" aria-label="Welcome to Budget CAR">
          <div className="brand">
            <Logo />
            <span className="brand-name">Budget CAR</span>
          </div>
          <h1>Welcome to Budget CAR</h1>
          <p>
            Smart budgeting designed specifically for students. Track expenses, 
            set goals, and take control of your finances with an easy-to-use envelope system.
          </p>
          <div className="perk">
            <i></i>
            <span>Student-focused categories (Textbooks, Tuition, Food, Rent)</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Visual progress tracking with weekly goals</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Receipt uploads and detailed transaction history</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Export reports and optional bank integration</span>
          </div>
        </section>

        {/* Right: Get Started panel */}
        <section className="panel" aria-labelledby="getStartedTitle">
          <h2 id="getStartedTitle" style={{ marginTop: 0 }}>Get Started</h2>
          <p className="hint">
            Join thousands of students who are taking control of their finances 
            and building better money habits.
          </p>

          <div style={{ 
            display: 'grid', 
            gap: '1rem', 
            marginTop: '1.5rem' 
          }}>
            <Link to="/signup" className="btn primary" style={{ textAlign: 'center' }}>
              Create Account
            </Link>
            
            <Link to="/login" className="btn secondary" style={{ textAlign: 'center' }}>
              Log In
            </Link>
          </div>

          <div className="footer-links" style={{ marginTop: '2rem' }}>
            <span className="hint">Free for students</span>
            <a href="#features">Learn More</a>
          </div>

          {/* Features Section */}
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Why Budget CAR?
            </h3>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.25rem',
              fontSize: '0.9rem',
              color: 'var(--muted)',
              lineHeight: '1.8'
            }}>
              <li>Envelope-style budgeting made simple</li>
              <li>Real-time expense tracking</li>
              <li>Low balance alerts and notifications</li>
              <li>Beautiful charts and progress visuals</li>
              <li>Mobile-friendly design</li>
              <li>Secure and private</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
