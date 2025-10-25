function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Budget CAR. All rights reserved.</p>
        <a href="/terms" className="footer-link">Terms of Service</a>
      </div>
    </footer>
  );
}

export default Footer;
