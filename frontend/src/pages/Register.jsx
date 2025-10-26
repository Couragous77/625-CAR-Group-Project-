import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import PasswordToggleButton from '../components/PasswordToggleButton';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
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

  // Password validation helper
  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    let strength = { score: 0, label: '', color: '' };
    if (metRequirements === 0) {
      strength = { score: 0, label: '', color: '' };
    } else if (metRequirements <= 2) {
      strength = { score: 1, label: 'Weak', color: '#ef4444' };
    } else if (metRequirements === 3) {
      strength = { score: 2, label: 'Medium', color: '#f59e0b' };
    } else if (metRequirements === 4) {
      strength = { score: 3, label: 'Strong', color: '#10b981' };
    }

    return { requirements, strength };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Real-time password strength validation
    if (name === 'password') {
      const { strength } = validatePassword(value);
      setPasswordStrength(strength);
    }
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
    
    // Enhanced password validation
    const { requirements } = validatePassword(formData.password);
    if (!requirements.minLength) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!requirements.hasUppercase) {
      setError('Password must include an uppercase letter');
      return;
    }
    if (!requirements.hasLowercase) {
      setError('Password must include a lowercase letter');
      return;
    }
    if (!requirements.hasNumber) {
      setError('Password must include a number');
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

  const { requirements: passwordReqs } = validatePassword(formData.password);

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
                <div className="password-input-wrapper">
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
                  <PasswordToggleButton 
                    showPassword={showPassword} 
                    onToggle={() => setShowPassword(!showPassword)} 
                  />
                </div>
                
                {/* Password Requirements */}
                <div className="password-hints">
                  <div className={`password-requirement ${passwordReqs.minLength ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordReqs.minLength ? '✓' : '○'}</span>
                    At least 8 characters
                  </div>
                  <div className={`password-requirement ${passwordReqs.hasUppercase ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordReqs.hasUppercase ? '✓' : '○'}</span>
                    One uppercase letter
                  </div>
                  <div className={`password-requirement ${passwordReqs.hasLowercase ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordReqs.hasLowercase ? '✓' : '○'}</span>
                    One lowercase letter
                  </div>
                  <div className={`password-requirement ${passwordReqs.hasNumber ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordReqs.hasNumber ? '✓' : '○'}</span>
                    One number
                  </div>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-label" style={{ color: passwordStrength.color }}>
                      Password strength: <strong>{passwordStrength.label}</strong>
                    </div>
                    <div className="strength-meter">
                      <div 
                        className="strength-meter-fill"
                        style={{ 
                          width: `${(passwordStrength.score / 3) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="password-input-wrapper">
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
                  <PasswordToggleButton 
                    showPassword={showConfirm} 
                    onToggle={() => setShowConfirm(!showConfirm)} 
                  />
                </div>
                
                {/* Password Match Validation */}
                {formData.confirm && (
                  <div className={`password-match-feedback ${formData.password === formData.confirm ? 'match' : 'no-match'}`}>
                    {formData.password === formData.confirm ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
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
