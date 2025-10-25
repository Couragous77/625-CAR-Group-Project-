import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Budget CAR. All rights reserved.</p>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/help" className="footer-link">Help</Link>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
