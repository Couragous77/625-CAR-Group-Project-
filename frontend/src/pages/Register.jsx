import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
    status: '',
    referral: '',
    tosAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.status) {
      setError('Please select your student status');
      return;
    }
    if (!formData.tosAccepted) {
      setError('You must agree to the Terms and Privacy Policy');
      return;
    }

    // Mock registration
    register({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      avatar: null
    });
    navigate('/dashboard');
  };

  return (
    <div className="page-center">
      <div className="auth-shell">
        {/* Left: Brand / benefits */}
        <section className="promo" aria-label="Welcome to Budget CAR">
          <div className="brand">
            <Logo />
            <span className="brand-name">Budget CAR</span>
          </div>
          <h1>Create your account</h1>
          <p>Set weekly goals, get alerts, and visualize your savings. It's budgeting made for students.</p>
        </section>

        {/* Right: Create Account form */}
        <section className="panel" aria-labelledby="createTitle">
          <h2 id="createTitle" style={{ marginTop: 0 }}>Create account</h2>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">School email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid">
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="control">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength="8"
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
                <div className="hint">Use at least 8 characters</div>
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="control">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength="8"
                    value={formData.confirm}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-eye"
                    aria-label="Show or hide password"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="hint">Passwords must match</div>
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <label htmlFor="status">Student status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select status</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="part-time">Part-time</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="referral">Referral (optional)</label>
                <input
                  id="referral"
                  name="referral"
                  type="text"
                  placeholder="Friend code or club"
                  value={formData.referral}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="hint" style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
              <input
                id="tosAccepted"
                name="tosAccepted"
                type="checkbox"
                checked={formData.tosAccepted}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the{' '}
                <a href="/terms" className="hint" style={{ textDecoration: 'underline' }}>
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy" className="hint" style={{ textDecoration: 'underline' }}>
                  Privacy Policy
                </a>.
              </span>
            </label>

            <button className="btn" type="submit">
              Create account
            </button>

            <div className="footer-links" style={{ marginTop: '0.6rem' }}>
              <span className="hint">Already have an account?</span>
              <Link to="/login">Log in</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Register;
