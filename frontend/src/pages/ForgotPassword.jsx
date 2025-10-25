import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      // TODO: Replace with actual API call to the FastAPI backend
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // For now, simulate success
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="page-center">
      <div className="auth-shell">
        {/* Left promo / value prop */}
        <section className="promo" aria-label="Why Budget CAR">
          <div className="brand">
            <Logo />
            <span className="brand-name">Budget CAR</span>
          </div>
          <h1>Reset your password</h1>
          <p>
            Don't worry! It happens to the best of us. Enter your email 
            address and we'll send you instructions to reset your password.
          </p>
          <div className="perk">
            <i></i>
            <span>Check your inbox and spam folder</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Link expires in 24 hours</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Still can't access? Contact support</span>
          </div>
        </section>

        {/* Right: Forgot password form */}
        <section className="panel" aria-labelledby="forgotPasswordTitle">
          {!submitted ? (
            <>
              <h2 id="forgotPasswordTitle" style={{ marginTop: 0 }}>
                Forgot Password?
              </h2>
              <p className="hint" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
                Enter your email and we'll send you a reset link
              </p>

              {error && (
                <div className="error show" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <div className="control">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button className="btn primary" type="submit">
                  Send Reset Link
                </button>

                <div className="footer-links">
                  <Link to="/login" className="hint">
                    ← Back to Login
                  </Link>
                  <Link to="/register">Create an account</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="success-message">
                <svg 
                  width="64" 
                  height="64" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ color: 'var(--good)', margin: '0 auto 1rem' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                
                <h2 style={{ marginTop: 0 }}>Check Your Email</h2>
                <p className="hint" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="hint" style={{ fontSize: '0.95rem', marginTop: '1rem' }}>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    type="button"
                    onClick={() => setSubmitted(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-2)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit',
                      fontWeight: 700
                    }}
                  >
                    try again
                  </button>
                </p>
              </div>

              <Link to="/login" className="btn primary" style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Return to Login
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
