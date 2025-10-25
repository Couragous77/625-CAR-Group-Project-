function TrackExpense() {
  return (
    <div className="form-container">
      <section className="panel">
        <h1>Track Expense</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Expense tracking functionality coming soon!');
          }}
        >
          <div className="field">
            <label htmlFor="expense-amount">Amount</label>
            <input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              placeholder="e.g., 12.99"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="expense-category">Category</label>
            <select id="expense-category" required>
              <option value="" disabled>Select category</option>
              <option>Textbooks</option>
              <option>Tuition</option>
              <option>Rent</option>
              <option>Food</option>
              <option>Entertainment</option>
              <option>Transportation</option>
              <option>Misc</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="expense-description">Description (optional)</label>
            <input id="expense-description" type="text" placeholder="e.g., Coffee at campus" />
          </div>

          <div className="field">
            <label htmlFor="expense-date">Date</label>
            <input id="expense-date" type="date" required />
          </div>

          <button className="btn primary" type="submit">
            Add Expense
          </button>
        </form>
      </section>
    </div>
  );
}

export default TrackExpense;
