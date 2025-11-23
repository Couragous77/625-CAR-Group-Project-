import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../services/authService';
import Logo from '../components/Logo';
import PasswordToggleButton from '../components/PasswordToggleButton';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  // Check if token is present
  useEffect(() => {
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ password: '', confirmPassword: '' });
    setIsLoading(true);

    // Validation
    let hasErrors = false;
    const newFieldErrors = { password: '', confirmPassword: '' };

    if (!password) {
      newFieldErrors.password = 'Password is required';
      hasErrors = true;
    } else if (password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }

    if (!confirmPassword) {
      newFieldErrors.confirmPassword = 'Please confirm your password';
      hasErrors = true;
    } else if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Call real API
      await confirmPasswordReset({
        token: token || tokenFromUrl,
        new_password: password,
      });

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset confirmation error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  return (
    <div className="page-center">
      <div className="auth-shell">
        {/* Left promo */}
        <section className="promo" aria-label="Reset Your Password">
          <div className="brand">
            <Logo />
            <span className="brand-name">Budget CAR</span>
          </div>
          <h1>Set New Password</h1>
          <p>
            Choose a strong password to keep your account secure.
          </p>
          <div className="perk">
            <i></i>
            <span>At least 6 characters</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Mix of letters and numbers recommended</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Avoid common words or patterns</span>
          </div>
        </section>

        {/* Right: Reset form */}
        <section className="panel" aria-labelledby="resetPasswordTitle">
          {!success ? (
            <>
              <h2 id="resetPasswordTitle" style={{ marginTop: 0 }}>
                Reset Your Password
              </h2>

              {error && (
                <div className="error show" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={fieldErrors.password ? 'error' : ''}
                      required
                      minLength={6}
                      autoFocus
                      aria-invalid={fieldErrors.password ? 'true' : 'false'}
                      aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    />
                    <PasswordToggleButton
                      showPassword={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                    />
                  </div>
                  {fieldErrors.password && (
                    <span id="password-error" className="field-error" role="alert">
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={fieldErrors.confirmPassword ? 'error' : ''}
                      required
                      minLength={6}
                      aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                      aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
                    />
                    <PasswordToggleButton
                      showPassword={showConfirm}
                      onToggle={() => setShowConfirm(!showConfirm)}
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span id="confirm-error" className="field-error" role="alert">
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  className="btn primary"
                  type="submit"
                  disabled={isLoading || !tokenFromUrl}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="footer-links">
                  <Link to="/login" className="hint">
                    ← Back to Login
                  </Link>
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

                <h2 style={{ marginTop: 0 }}>Password Reset Successfully!</h2>
                <p className="hint" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  Your password has been updated. You can now log in with your new password.
                </p>
                <p className="hint" style={{ fontSize: '0.95rem', marginTop: '1rem' }}>
                  Redirecting to login page...
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
