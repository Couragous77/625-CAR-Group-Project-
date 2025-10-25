function TrackIncome() {
  return (
    <div className="form-container">
      <section className="panel">
        <h1>Track Income</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Income tracking functionality coming soon!');
          }}
        >
          <div className="field">
            <label htmlFor="income-amount">Amount</label>
            <input
              id="income-amount"
              type="number"
              inputMode="decimal"
              placeholder="e.g., 500.00"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="income-source">Source</label>
            <select id="income-source" required>
              <option value="" disabled>Select source</option>
              <option>Scholarship</option>
              <option>Part-time Job</option>
              <option>Allowance</option>
              <option>Freelance</option>
              <option>Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="income-description">Description (optional)</label>
            <input id="income-description" type="text" placeholder="e.g., Weekly paycheck" />
          </div>

          <div className="field">
            <label htmlFor="income-date">Date</label>
            <input id="income-date" type="date" required />
          </div>

          <button className="btn primary" type="submit">
            Add Income
          </button>
        </form>
      </section>
    </div>
  );
}

export default TrackIncome;
