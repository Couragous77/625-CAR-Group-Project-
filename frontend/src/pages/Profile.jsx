import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="form-container">
      <section className="panel">
        <h1>Profile</h1>
        <div className="field">
          <label>Name</label>
          <p><strong>{user?.firstName} {user?.lastName}</strong></p>
        </div>
        <div className="field">
          <label>Email</label>
          <p><strong>{user?.email}</strong></p>
        </div>
        <div className="field">
          <label>Student Status</label>
          <p><strong>Undergraduate</strong></p>
        </div>
        <div className="divider"></div>
        <p className="muted">Profile editing functionality coming soon.</p>
      </section>
    </div>
  );
}

export default Profile;
