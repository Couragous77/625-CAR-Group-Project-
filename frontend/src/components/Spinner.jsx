import '../styles/spinner.css';

export default function Spinner({ size = 'medium', message = '' }) {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}
