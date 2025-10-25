import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function About() {
  return (
    <div className="content-page">
      <div className="content-container">
        <div className="content-header">
          <div className="about-logo">
            <Logo className="logo-car-svg" />
          </div>
          <h1>About Budget CAR</h1>
          <p className="content-subtitle">Empowering students to take control of their finances</p>
        </div>

        <div className="content-body">
          <section>
            <h2>Our Mission</h2>
            <p>
              Budget CAR is designed to help college students navigate the challenges of managing 
              finances during their academic journey. We understand that balancing tuition, textbooks, 
              rent, food, and entertainment can be overwhelming. Our mission is to provide a simple, 
              intuitive budgeting tool that empowers students to make informed financial decisions 
              and build healthy money habits that last a lifetime.
            </p>
          </section>

          <section>
            <h2>Why "CAR"?</h2>
            <p>
              CAR stands for <strong>Control, Allocate, Review</strong> — the three fundamental 
              principles of effective budgeting:
            </p>
            <ul>
              <li><strong>Control:</strong> Take charge of your spending with real-time expense tracking</li>
              <li><strong>Allocate:</strong> Distribute your money wisely using envelope-style budgeting</li>
              <li><strong>Review:</strong> Analyze your financial patterns with visual insights and reports</li>
            </ul>
            <p>
              Just like a car gets you where you need to go, Budget CAR helps you reach your financial goals!
            </p>
          </section>

          <section>
            <h2>Built for Students, By Students</h2>
            <p>
              Budget CAR was created as a collaborative group project by students who experienced 
              firsthand the financial pressures of college life. We wanted to build something that 
              truly addressed the unique needs of student budgeting — from managing financial aid 
              disbursements to tracking textbook expenses and meal plan spending.
            </p>
          </section>

          <section>
            <h2>Key Features</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <h3>📊 Envelope Budgeting</h3>
                <p>Allocate your money into student-focused categories like Tuition, Textbooks, Food, and Rent</p>
              </div>
              <div className="feature-item">
                <h3>💰 Expense Tracking</h3>
                <p>Log expenses quickly with multiple payment methods and optional receipt uploads</p>
              </div>
              <div className="feature-item">
                <h3>📈 Visual Insights</h3>
                <p>Understand your spending patterns with charts, graphs, and weekly progress tracking</p>
              </div>
              <div className="feature-item">
                <h3>🎯 Goal Setting</h3>
                <p>Set savings goals and track your progress toward financial milestones</p>
              </div>
              <div className="feature-item">
                <h3>📱 Mobile Responsive</h3>
                <p>Access your budget anywhere, on any device — perfect for on-the-go students</p>
              </div>
              <div className="feature-item">
                <h3>📄 Export & Reports</h3>
                <p>Generate reports and export your transaction history for record-keeping</p>
              </div>
            </div>
          </section>

          <section>
            <h2>The Technology</h2>
            <p>
              Budget CAR is built with modern web technologies to ensure a fast, reliable, and 
              secure experience:
            </p>
            <ul>
              <li><strong>Frontend:</strong> React 18 with Vite for a lightning-fast user interface</li>
              <li><strong>Backend:</strong> FastAPI with Python for robust API endpoints</li>
              <li><strong>Database:</strong> PostgreSQL for secure, reliable data storage</li>
              <li><strong>Security:</strong> Industry-standard encryption and authentication practices</li>
            </ul>
          </section>

          <section>
            <h2>Our Commitment to Students</h2>
            <p>
              As an educational project, Budget CAR is provided free of charge to help students 
              succeed financially. We are committed to:
            </p>
            <ul>
              <li>Keeping your financial data private and secure</li>
              <li>Never selling or sharing your personal information</li>
              <li>Providing tools specifically designed for student budgets</li>
              <li>Continuously improving based on student feedback</li>
              <li>Maintaining transparency in how we handle data</li>
            </ul>
          </section>

          <section>
            <h2>Educational Philosophy</h2>
            <p>
              We believe financial literacy is a crucial life skill that should be accessible to 
              everyone. Budget CAR is more than just a budgeting app — it's a learning tool that 
              helps students develop healthy financial habits, understand spending patterns, and 
              make data-driven decisions about their money.
            </p>
          </section>

          <section>
            <h2>Get Started Today</h2>
            <p>
              Whether you're managing student loans, part-time job income, or financial aid, 
              Budget CAR is here to help you take control of your finances. Join thousands of 
              students who are already using Budget CAR to build a brighter financial future.
            </p>
          </section>

          <div className="content-footer">
            <p className="about-tagline">
              💚 Built with care for students, by students who understand the financial journey.
            </p>
            <div className="content-actions">
              <Link to="/register" className="btn primary">Create Free Account</Link>
              <Link to="/help" className="btn secondary">View Help Center</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
