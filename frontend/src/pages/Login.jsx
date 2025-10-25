import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter a valid email and password.');
      return;
    }

    try {
      // TODO: Replace with actual API call to the FastAPI backend
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // For now, use mock authentication
      login({
        email: formData.email,
        firstName: 'Budget',
        lastName: 'User',
        avatar: null
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="control">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@school.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="control">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-eye"
                  aria-label="Show or hide password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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

            <button className="btn primary" type="submit">
              Log in
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
