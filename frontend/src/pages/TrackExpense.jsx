import { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import '../styles/trackExpense.css';

function TrackExpense() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="track-expense-page">
      <div className="page-header">
        <h1>Expense Tracker</h1>
        <p className="subtitle">Track and manage your expenses</p>
      </div>

      {/* Add Expense Form */}
      <section className="panel">
        <h2>Add New Expense</h2>
        <ExpenseForm 
          transactionType="expense"
          onSuccess={() => {
            // Force list to refresh by changing key
            setRefreshKey(prev => prev + 1);
          }} 
        />
      </section>

      {/* Expense List */}
      <section className="panel">
        <h2>Your Expenses</h2>
        <ExpenseList 
          transactionType="expense"
          refreshKey={refreshKey} 
        />
      </section>
    </div>
  );
}

export default TrackExpense;
