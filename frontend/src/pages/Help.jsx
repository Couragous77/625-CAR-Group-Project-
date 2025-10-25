import { useState } from 'react';
import { Link } from 'react-router-dom';

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        <span>{question}</span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="faq-icon"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
}

export default function Help() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is envelope budgeting and how does it work?",
      answer: (
        <>
          <p>
            Envelope budgeting is a simple method where you divide your money into different 
            "envelopes" (categories) at the start of each month. Each envelope represents a 
            spending category like Food, Rent, or Textbooks.
          </p>
          <p>
            Once you allocate money to an envelope, you can only spend what's in that envelope. 
            This helps prevent overspending and ensures you have money for all your needs. When 
            an envelope is empty, you stop spending in that category or move money from another envelope.
          </p>
        </>
      ),
    },
    {
      question: "How do I get started with Budget CAR?",
      answer: (
        <>
          <p>Getting started is easy! Follow these steps:</p>
          <ol>
            <li><strong>Create an account:</strong> Click "Sign Up" and enter your basic information</li>
            <li><strong>Set up your budget:</strong> Add your monthly income and allocate it to categories</li>
            <li><strong>Add transactions:</strong> Start tracking your expenses and income as they occur</li>
            <li><strong>Review regularly:</strong> Check your dashboard weekly to see your progress</li>
          </ol>
          <p>
            We recommend starting with pre-made student categories like Tuition, Textbooks, Food, 
            Rent, Transportation, and Entertainment. You can customize these later!
          </p>
        </>
      ),
    },
    {
      question: "What budget categories should I use as a student?",
      answer: (
        <>
          <p>Budget CAR comes with student-focused categories:</p>
          <ul>
            <li><strong>Tuition & Fees:</strong> Semester payments, lab fees, course materials</li>
            <li><strong>Textbooks & Supplies:</strong> Course books, notebooks, software, equipment</li>
            <li><strong>Housing:</strong> Rent, utilities, dorm fees, furniture</li>
            <li><strong>Food & Dining:</strong> Groceries, meal plan, restaurants, coffee</li>
            <li><strong>Transportation:</strong> Gas, parking, bus pass, rideshare</li>
            <li><strong>Entertainment:</strong> Movies, concerts, hobbies, subscriptions</li>
            <li><strong>Personal Care:</strong> Toiletries, haircuts, gym membership</li>
            <li><strong>Savings:</strong> Emergency fund, future goals, travel</li>
          </ul>
          <p>You can customize or add categories based on your specific needs!</p>
        </>
      ),
    },
    {
      question: "How do I track expenses?",
      answer: (
        <>
          <p>
            Navigate to "Track Expense" from the dashboard or menu. Enter the amount, select a 
            category, choose your payment method (cash, card, financial aid), and optionally add 
            a description or upload a receipt photo.
          </p>
          <p>
            The expense will automatically deduct from your budget envelope for that category. 
            You'll see your remaining budget update in real-time!
          </p>
        </>
      ),
    },
    {
      question: "Can I upload receipts?",
      answer: (
        <>
          <p>
            Yes! When adding an expense, you have the option to upload a photo of your receipt. 
            This helps you keep digital records of your purchases and can be useful for:
          </p>
          <ul>
            <li>Tracking warranty information for textbooks or electronics</li>
            <li>Keeping records for reimbursements or financial aid audits</li>
            <li>Disputing charges or returning items</li>
            <li>Tax documentation for education-related expenses</li>
          </ul>
          <p>Receipt uploads are optional and stored securely with your account.</p>
        </>
      ),
    },
    {
      question: "How do I add income (like from a part-time job or financial aid)?",
      answer: (
        <>
          <p>
            Go to "Track Income" from the menu. Enter the amount, select the source (job, financial 
            aid, gift, etc.), and add any notes. Your income will be added to your available money 
            for budgeting.
          </p>
          <p>
            Tip: When you receive financial aid disbursements, add them as income and immediately 
            allocate them to your envelopes (tuition, textbooks, rent, etc.) for the semester.
          </p>
        </>
      ),
    },
    {
      question: "What if I overspend in a category?",
      answer: (
        <>
          <p>
            If you overspend in an envelope, Budget CAR will show a negative balance. You have 
            two options:
          </p>
          <ol>
            <li><strong>Move money:</strong> Transfer funds from another envelope that has surplus</li>
            <li><strong>Adjust next month:</strong> Allocate more to that category in your next budget</li>
          </ol>
          <p>
            The key is staying aware of your spending. Regular check-ins help you catch overspending 
            early and make adjustments before it becomes a problem.
          </p>
        </>
      ),
    },
    {
      question: "Is my financial data secure?",
      answer: (
        <>
          <p>
            Yes! We take security seriously. Your data is protected with:
          </p>
          <ul>
            <li>Encrypted passwords using industry-standard bcrypt hashing</li>
            <li>Secure HTTPS connections for all data transmission</li>
            <li>Private database storage with restricted access</li>
            <li>No third-party data sharing — your information stays with Budget CAR</li>
          </ul>
          <p>
            For more details, read our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </>
      ),
    },
    {
      question: "Can I export my transaction history?",
      answer: (
        <>
          <p>
            Yes! Budget CAR allows you to export your transactions and budget reports. This is 
            useful for:
          </p>
          <ul>
            <li>Keeping personal financial records</li>
            <li>Sharing with parents or financial advisors</li>
            <li>Tax preparation (especially for education credits)</li>
            <li>Analyzing long-term spending patterns</li>
          </ul>
          <p>Look for the "Export" option in your dashboard or profile settings.</p>
        </>
      ),
    },
    {
      question: "How often should I check my budget?",
      answer: (
        <>
          <p>
            We recommend checking your budget at least weekly, especially when you're first starting. 
            This helps you:
          </p>
          <ul>
            <li>Stay aware of your spending patterns</li>
            <li>Catch potential overspending early</li>
            <li>Adjust your habits in real-time</li>
            <li>Feel more in control of your finances</li>
          </ul>
          <p>
            Many successful Budget CAR users check their dashboard every few days or after major 
            purchases. The more engaged you are, the better your results!
          </p>
        </>
      ),
    },
    {
      question: "What are budget goals and how do I use them?",
      answer: (
        <>
          <p>
            Budget goals help you save for specific things like:
          </p>
          <ul>
            <li>Emergency fund (we recommend $500-1000 for students)</li>
            <li>Study abroad programs or internships</li>
            <li>Summer travel or spring break</li>
            <li>New laptop or textbooks for next semester</li>
            <li>Moving expenses for after graduation</li>
          </ul>
          <p>
            Set a goal amount and target date, then Budget CAR will track your progress and show 
            you how much to save each month to reach your goal on time.
          </p>
        </>
      ),
    },
    {
      question: "Can I use Budget CAR on my phone?",
      answer: (
        <>
          <p>
            Yes! Budget CAR is fully responsive and works great on phones, tablets, and computers. 
            Access it through any web browser — no app download needed.
          </p>
          <p>
            The mobile interface is optimized for quick expense tracking on the go, perfect for 
            logging purchases right after you make them.
          </p>
        </>
      ),
    },
    {
      question: "What if I forget my password?",
      answer: (
        <>
          <p>
            Click "Forgot Password" on the login page. You'll receive instructions to reset your 
            password via email. For security reasons, always use a strong, unique password and 
            keep it safe.
          </p>
        </>
      ),
    },
    {
      question: "Is Budget CAR really free?",
      answer: (
        <>
          <p>
            Yes! Budget CAR is an educational project created to help students manage their finances 
            without any cost. There are no hidden fees, premium tiers, or subscription charges.
          </p>
          <p>
            We don't sell ads or your data. Our goal is simply to help students succeed financially 
            during their college years.
          </p>
        </>
      ),
    },
    {
      question: "How do I delete my account?",
      answer: (
        <>
          <p>
            If you need to delete your account, go to your Profile settings and look for the 
            "Delete Account" option. This will permanently remove all your data from our system 
            within 30 days.
          </p>
          <p>
            Before deleting, consider exporting your transaction history if you want to keep 
            records for yourself.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="content-container">
        <div className="content-header">
          <h1>Help Center</h1>
          <p className="content-subtitle">Common questions and helpful tips for Budget CAR</p>
        </div>

        <div className="content-body">
          <section>
            <h2>Frequently Asked Questions</h2>
            <p className="help-intro">
              Can't find what you're looking for? Check out our comprehensive FAQ below, or visit 
              the <Link to="/about">About page</Link> to learn more about Budget CAR.
            </p>
            
            <div className="faq-container">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => toggleFAQ(index)}
                />
              ))}
            </div>
          </section>

          <section className="help-tips">
            <h2>Quick Tips for Success</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-icon">💡</span>
                <h3>Start Small</h3>
                <p>Begin with just 3-4 main categories and expand as you get comfortable</p>
              </div>
              <div className="tip-card">
                <span className="tip-icon">📅</span>
                <h3>Budget Weekly</h3>
                <p>Review your budget every week to stay on track and adjust as needed</p>
              </div>
              <div className="tip-card">
                <span className="tip-icon">💰</span>
                <h3>Track Everything</h3>
                <p>Log even small purchases — they add up quickly and can derail your budget</p>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🎯</span>
                <h3>Set Realistic Goals</h3>
                <p>Choose achievable savings targets that motivate rather than discourage</p>
              </div>
            </div>
          </section>

          <div className="content-footer">
            <div className="help-contact">
              <h3>Still need help?</h3>
              <p>
                Review our <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link> for additional information, or contact 
                us through the app if you have specific questions.
              </p>
            </div>
            <div className="content-actions">
              <Link to="/about" className="btn secondary">Learn About Budget CAR</Link>
              <Link to="/dashboard" className="btn primary">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
