import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import PasswordToggleButton from '../components/PasswordToggleButton';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });
    setIsLoading(true);

    // Basic validation
    let hasErrors = false;
    const newFieldErrors = { email: '', password: '' };

    if (!formData.email) {
      newFieldErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!formData.email.includes('@')) {
      newFieldErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
      hasErrors = true;
    } else if (formData.password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Call real API through AuthContext
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear general error when user starts typing
    if (error) {
      setError('');
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
          <h1>Smart, simple budgeting for students</h1>
          <p>
            Envelope-style budgeting, receipt upload, alerts, and fun progress visuals.
            Stay on track without the stress.
          </p>
          <div className="perk">
            <i></i>
            <span>Student-first categories (Textbooks, Tuition, Meal Plan)</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Weekly goals + piggy bank progress</span>
          </div>
          <div className="perk">
            <i></i>
            <span>Export to Excel and optional bank linking</span>
          </div>
        </section>

        {/* Right: Login form */}
        <section className="panel" aria-labelledby="loginTitle">
          <h2 id="loginTitle" style={{ marginTop: 0 }}>Log in</h2>

          {error && (
            <div className="error show" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@school.edu"
                value={formData.email}
                onChange={handleChange}
                className={fieldErrors.email ? 'error' : ''}
                required
                aria-invalid={fieldErrors.email ? 'true' : 'false'}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="email-error" className="field-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? 'error' : ''}
                  required
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

            <div className="row">
              <label className="hint">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                {' '}Remember me
              </label>
              <Link to="/forgot-password" className="hint">Forgot password?</Link>
            </div>

            <button className="btn primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>

            <div className="footer-links">
              <span className="hint">New here?</span>
              <Link to="/register">Create an account</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
