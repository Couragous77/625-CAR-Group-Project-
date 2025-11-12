import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';
import Logo from '../components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setIsLoading(true);

    // Basic email validation
    if (!email) {
      setFieldError('Email is required');
      setIsLoading(false);
      return;
    }
    
    if (!email.includes('@')) {
      setFieldError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Call real API
      await requestPasswordReset(email);
      
      // Show success message
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (fieldError) setFieldError('');
    if (error) setError('');
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

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={handleEmailChange}
                    className={fieldError ? 'error' : ''}
                    required
                    autoFocus
                    aria-invalid={fieldError ? 'true' : 'false'}
                    aria-describedby={fieldError ? 'email-error' : undefined}
                  />
                  {fieldError && (
                    <span id="email-error" className="field-error" role="alert">
                      {fieldError}
                    </span>
                  )}
                </div>

                <button className="btn primary" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
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
