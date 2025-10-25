import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="content-page">
      <div className="content-container">
        <div className="content-header">
          <h1>Terms of Service</h1>
          <p className="content-subtitle">Last updated: October 24, 2025</p>
        </div>

        <div className="content-body">
          <section>
            <h2>1. About Budget CAR</h2>
            <p>
              Budget CAR is a student budgeting application developed as an educational group project. 
              This service is provided free of charge to help college students manage their finances 
              effectively through envelope-style budgeting, expense tracking, and financial insights.
            </p>
          </section>

          <section>
            <h2>2. Acceptance of Terms</h2>
            <p>
              By accessing and using Budget CAR, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section>
            <h2>3. User Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. 
              You agree to accept responsibility for all activities that occur under your account. 
              Please notify us immediately of any unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2>4. Educational Purpose</h2>
            <p>
              Budget CAR is created as an educational project. While we strive to provide accurate 
              financial tracking tools, this application should not be considered professional 
              financial advice. Always consult with qualified financial advisors for important 
              financial decisions.
            </p>
          </section>

          <section>
            <h2>5. User Data & Privacy</h2>
            <p>
              Your financial data is stored securely and is never shared with third parties. 
              You retain ownership of all data you input into Budget CAR. For more information 
              about how we handle your data, please review our <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2>6. Acceptable Use</h2>
            <p>You agree to use Budget CAR only for lawful purposes. You will not:</p>
            <ul>
              <li>Attempt to gain unauthorized access to other users' accounts or data</li>
              <li>Use the service to store or transmit malicious code</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to reverse engineer or modify the application</li>
              <li>Use automated tools to access the service without permission</li>
            </ul>
          </section>

          <section>
            <h2>7. Service Availability</h2>
            <p>
              As an educational project, Budget CAR is provided "as is" without guarantees of 
              continuous availability. We may modify, suspend, or discontinue any aspect of the 
              service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2>8. Data Backup</h2>
            <p>
              While we make reasonable efforts to protect your data, we recommend maintaining 
              your own records of important financial information. We are not responsible for 
              any data loss that may occur.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              Budget CAR and its developers are not liable for any direct, indirect, incidental, 
              or consequential damages arising from your use of the service. This includes any 
              financial decisions made based on the information provided by the application.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of Budget CAR 
              after changes constitutes acceptance of the modified terms. We will make reasonable 
              efforts to notify users of significant changes.
            </p>
          </section>

          <section>
            <h2>11. Student-Focused Features</h2>
            <p>
              Budget CAR is specifically designed for college students and includes categories 
              relevant to student life (tuition, textbooks, meal plans, etc.). The budgeting 
              strategies and recommendations are tailored to typical student financial situations.
            </p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please visit our{' '}
              <Link to="/help">Help Center</Link> or contact us through the app.
            </p>
          </section>

          <div className="content-footer">
            <p>
              By using Budget CAR, you acknowledge that you have read, understood, and agree 
              to these Terms of Service.
            </p>
            <div className="content-actions">
              <Link to="/" className="btn secondary">Back to Home</Link>
              <Link to="/privacy" className="btn primary">Read Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
