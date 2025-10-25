import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="content-page">
      <div className="content-container">
        <div className="content-header">
          <h1>Privacy Policy</h1>
          <p className="content-subtitle">Last updated: October 24, 2025</p>
        </div>

        <div className="content-body">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Budget CAR's Privacy Policy. We are committed to protecting your privacy 
              and handling your personal and financial data with care. This policy explains how 
              we collect, use, and safeguard your information as a student user of our budgeting application.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>Account Information</h3>
            <ul>
              <li>Name and email address</li>
              <li>Account credentials (password is encrypted)</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3>Financial Data</h3>
            <ul>
              <li>Income and expense transactions you manually enter</li>
              <li>Budget categories and allocation amounts</li>
              <li>Receipt images you choose to upload (optional)</li>
              <li>Financial goals and savings targets</li>
            </ul>

            <h3>Usage Information</h3>
            <ul>
              <li>App interaction patterns to improve user experience</li>
              <li>Technical information (browser type, device information)</li>
              <li>Log data for troubleshooting and security purposes</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul>
              <li><strong>Provide the Service:</strong> Track expenses, manage budgets, and generate financial insights</li>
              <li><strong>Improve Features:</strong> Understand how students use the app to enhance functionality</li>
              <li><strong>Communicate:</strong> Send important notifications about your account and budgets</li>
              <li><strong>Security:</strong> Protect your account and prevent unauthorized access</li>
              <li><strong>Educational Analysis:</strong> Aggregate anonymous data for project reporting (no personal data shared)</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We take data security seriously and implement industry-standard measures to protect your information:
            </p>
            <ul>
              <li>All passwords are encrypted using bcrypt hashing</li>
              <li>Data is transmitted using secure HTTPS connections</li>
              <li>Database access is restricted and monitored</li>
              <li>Regular security updates and patches are applied</li>
              <li>Your financial data is stored in an isolated database environment</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Sharing & Third Parties</h2>
            <p>
              <strong>We do not sell, rent, or share your personal or financial data with third parties.</strong>
            </p>
            <p>
              As an educational project, your data stays within the Budget CAR system. We may share 
              anonymized, aggregated statistics for academic purposes, but this data cannot be used 
              to identify individual users.
            </p>
          </section>

          <section>
            <h2>6. Your Rights & Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> View all data associated with your account at any time</li>
              <li><strong>Edit:</strong> Update or correct your personal information</li>
              <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Download your transaction history and budget data</li>
              <li><strong>Opt-out:</strong> Disable optional features like notifications or analytics</li>
            </ul>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, 
              your personal data will be permanently removed from our systems within 30 days, except 
              where we are required to retain certain information for legal or security purposes.
            </p>
          </section>

          <section>
            <h2>8. Student Privacy Considerations</h2>
            <p>
              We understand that many users are students, and we take extra care with student data:
            </p>
            <ul>
              <li>We do not require or collect student ID numbers or SSN</li>
              <li>We do not share data with educational institutions</li>
              <li>We do not use your data for targeted advertising</li>
              <li>Age verification ensures compliance with privacy regulations (must be 18+)</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookies & Tracking</h2>
            <p>
              Budget CAR uses minimal cookies to maintain your login session and remember your 
              preferences. We do not use third-party tracking cookies or analytics services that 
              share your data externally.
            </p>
          </section>

          <section>
            <h2>10. Educational Project Status</h2>
            <p>
              Budget CAR is created as an educational group project. While we implement professional 
              security practices, this is not a commercial financial service. Users should be aware 
              of the educational nature of the project when deciding what information to input.
            </p>
          </section>

          <section>
            <h2>11. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. 
              We will notify users of significant changes via email or in-app notification. Continued 
              use after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>12. Contact & Questions</h2>
            <p>
              If you have questions or concerns about your privacy or this policy, please:
            </p>
            <ul>
              <li>Visit our <Link to="/help">Help Center</Link> for FAQs</li>
              <li>Contact us through the app's support feature</li>
              <li>Review our <Link to="/terms">Terms of Service</Link> for additional information</li>
            </ul>
          </section>

          <div className="content-footer">
            <p>
              Your privacy matters to us. Budget CAR is designed to help students manage finances 
              confidently while keeping their data secure and private.
            </p>
            <div className="content-actions">
              <Link to="/" className="btn secondary">Back to Home</Link>
              <Link to="/terms" className="btn primary">Read Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
