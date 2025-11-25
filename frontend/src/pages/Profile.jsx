import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, saveProfile, loading } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    studentStatus: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        studentStatus: user.studentStatus || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await saveProfile({
        first_name: form.firstName,
        last_name: form.lastName,
        student_status: form.studentStatus,
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="form-container">
      <section className="panel">
        <h1>Profile</h1>
        {loading ? (
          <p className="muted">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                maxLength={100}
                autoComplete="given-name"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                maxLength={100}
                autoComplete="family-name"
              />
            </div>
            <div className="field">
              <label htmlFor="studentStatus">Student status</label>
              <select
                id="studentStatus"
                name="studentStatus"
                value={form.studentStatus}
                onChange={(e) => handleChange('studentStatus', e.target.value)}
              >
                <option value="">Select status</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="part-time">Part-time</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save changes'}
            </button>

            {message && <p className="success" style={{ marginTop: '0.75rem' }}>{message}</p>}
            {error && <p className="danger" style={{ marginTop: '0.75rem' }}>{error}</p>}
          </form>
        )}
      </section>
    </div>
  );
}

export default Profile;
